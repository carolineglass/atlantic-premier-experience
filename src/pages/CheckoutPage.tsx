import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { cartTotal, orderPlaced } from '@/store/slices/cartSlice';
import { requestResecure } from '@/hooks/useReservationSync';
import { reservationsApi, ordersApi } from '@/api/reservations';
import { formatEventDateTime } from '@/utils/dateFormatters';
import type { ReservationGuest, OrderRequestProduct } from '@/types/booking';

interface GuestForm {
  ticketOptionId: number;
  label: string;
  firstName: string;
  lastName: string;
}

/**
 * Checkout: collects guest names for every held ticket (lead guest also
 * provides email + phone), then confirms the reservation to place the
 * booking. No card payment — the TC API uses the agent invoice model, so
 * a confirmed order lands as "pending payment".
 */
export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((state) => state.cart.items);
  const reservation = useAppSelector((state) => state.cart.reservation);

  // Guest rows are keyed by "ticketOptionId x quantity" per line — this only
  // changes when the actual cart contents change, not on every Redux
  // dispatch (the reservation sync fires several while checkout is mounted,
  // e.g. re-securing a hold, and each one produces a new `items` array
  // reference; recomputing off that reference wiped names the user had
  // already typed)
  const cartSignature = items
    .map((i) => `${i.ticketOptionId}x${i.quantity}`)
    .join(',');

  const [guests, setGuests] = useState<GuestForm[]>([]);
  const seededSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (seededSignatureRef.current === cartSignature) return;
    seededSignatureRef.current = cartSignature;
    setGuests(
      items.flatMap((item) =>
        Array.from({ length: item.quantity }, (_, i) => ({
          ticketOptionId: item.ticketOptionId,
          label: `${item.eventName} — ${item.ticketName} (ticket ${i + 1} of ${item.quantity})`,
          firstName: '',
          lastName: '',
        }))
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSignature]);

  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live countdown on the hold
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">Nothing to check out</h1>
        <p className="mt-3 text-ink-muted">Your cart is empty.</p>
        <Link to="/fixtures" className="btn-secondary mt-8">
          Browse fixtures
        </Link>
      </div>
    );
  }

  const holding = reservation?.status === 'holding' && reservation.number;
  const secondsLeft = reservation?.expiresAt
    ? Math.max(0, Math.floor(reservation.expiresAt - now / 1000))
    : null;
  const countdown =
    secondsLeft != null
      ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
      : null;

  const total = reservation?.priceTotal ?? cartTotal(items);

  const setGuestField = (
    index: number,
    field: 'firstName' | 'lastName',
    value: string
  ) => {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  };

  const expectedGuestCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const formValid =
    guests.length === expectedGuestCount &&
    guests.every((g) => g.firstName.trim() && g.lastName.trim()) &&
    leadEmail.trim().includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding || !reservation?.number || !formValid) return;
    setSubmitting(true);
    setError(null);

    const payload: ReservationGuest[] = guests.map((g, i) => ({
      first_name: g.firstName.trim(),
      last_name: g.lastName.trim(),
      ticket_option_id: g.ticketOptionId,
      lead: i === 0,
      ...(i === 0
        ? { email: leadEmail.trim(), phone: leadPhone.trim() || null }
        : {}),
    }));

    const spansMultipleCategories =
      new Set(items.map((i) => i.ticketOptionId)).size > 1;

    try {
      let orderNo: string;
      let total: string | number;
      let currency: string;

      if (spansMultipleCategories) {
        // Workaround for a confirmed sandbox defect: reservations/confirm
        // redirects instead of confirming whenever the hold spans more than
        // one ticket category (verified in isolation — see reservations.ts).
        // Book directly via /orders using the same guest data instead.
        const guestsByTicket = new Map<number, typeof guests>();
        guests.forEach((g) => {
          const list = guestsByTicket.get(g.ticketOptionId) ?? [];
          list.push(g);
          guestsByTicket.set(g.ticketOptionId, list);
        });

        const orderProducts: OrderRequestProduct[] = items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          ticket_option: item.ticketOptionId,
          delivery_method: item.deliveryMethodId,
          guests: (guestsByTicket.get(item.ticketOptionId) ?? []).map(
            (g, i) => ({
              first_name: g.firstName.trim(),
              last_name: g.lastName.trim(),
              ...(item === items[0] && i === 0
                ? { email: leadEmail.trim(), phone: leadPhone.trim() || null }
                : {}),
            })
          ),
        }));

        const res = await ordersApi.create(orderProducts);
        orderNo = res.order.order_no;
        total = res.order.total;
        currency = res.order.currency;
        // The order supersedes the held reservation — release it
        reservationsApi.cancel(reservation.number).catch(() => undefined);
      } else {
        const res = await reservationsApi.confirm(reservation.number, payload);
        orderNo = res.order.order_no;
        total = res.order.total;
        currency = res.order.currency;
      }

      dispatch(
        orderPlaced({ order_no: orderNo, total, currency, status: 'confirmed' })
      );
      navigate('/checkout/success');
    } catch (err) {
      console.error('Confirm reservation failed:', err);
      const message = err instanceof Error ? err.message : '';
      setError(
        message.includes('422')
          ? 'The booking could not be placed — please check the guest details and try again.'
          : message.includes('redirected')
            ? 'The booking could not be placed — the request was rejected. Please try again.'
            : 'The booking could not be placed. Your ticket hold may have expired — re-secure and try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Guest form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-bold">Ticket holders</h2>
            <p className="mt-2 text-sm text-ink-muted">
              A name for every ticket. The first guest is the lead booker and
              receives the confirmation.
            </p>

            <div className="mt-6 space-y-6">
              {guests.map((guest, i) => (
                <div key={`${guest.ticketOptionId}-${i}`}>
                  <p className="text-sm font-semibold text-ink-soft">
                    {i === 0 && (
                      <span className="chip mr-2 bg-ocean-50 text-ocean-700">
                        Lead booker
                      </span>
                    )}
                    {guest.label}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={guest.firstName}
                      onChange={(e) => setGuestField(i, 'firstName', e.target.value)}
                      placeholder="First name"
                      required
                      className="rounded-xl border border-gray-200 px-4 py-2.5 focus:border-ink focus:outline-none"
                    />
                    <input
                      type="text"
                      value={guest.lastName}
                      onChange={(e) => setGuestField(i, 'lastName', e.target.value)}
                      placeholder="Last name"
                      required
                      className="rounded-xl border border-gray-200 px-4 py-2.5 focus:border-ink focus:outline-none"
                    />
                  </div>
                  {i === 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        className="rounded-xl border border-gray-200 px-4 py-2.5 focus:border-ink focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="rounded-xl border border-gray-200 px-4 py-2.5 focus:border-ink focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!holding || !formValid || submitting}
            className="btn-primary w-full"
          >
            {submitting
              ? 'Placing booking…'
              : holding
                ? `Place booking · £${total.toFixed(2)}`
                : 'Ticket hold inactive'}
          </button>
          <p className="text-center text-xs text-ink-muted">
            Bookings are placed against the Travel Connection sandbox and
            settled by invoice — no card is charged here.
          </p>
        </form>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Your tickets</h2>

            <div className="mt-3">
              {holding && countdown && (
                <span className="chip bg-ocean-50 text-ocean-700">
                  Held for {countdown}
                </span>
              )}
              {reservation?.status === 'expired' && (
                <span className="flex items-center gap-3">
                  <span className="chip bg-gold-50 text-gold-700">
                    Hold expired
                  </span>
                  <button
                    type="button"
                    onClick={requestResecure}
                    className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
                  >
                    Re-secure
                  </button>
                </span>
              )}
              {reservation?.status === 'syncing' && (
                <span className="chip bg-gray-100 text-ink-soft">
                  Securing tickets…
                </span>
              )}
            </div>

            <ul className="mt-4 divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.ticketOptionId} className="py-3">
                  <p className="font-display font-bold leading-snug">
                    {item.eventName}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {formatEventDateTime(item.eventDate)}
                  </p>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-ink-soft">
                      {item.quantity} × {item.ticketName}
                    </span>
                    <span className="font-semibold">
                      £{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 font-display text-xl font-bold">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
