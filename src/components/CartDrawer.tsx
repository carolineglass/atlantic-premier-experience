import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  cartTotal,
  removeFromCart,
  updateQuantity,
} from '@/store/slices/cartSlice';
import { requestResecure } from '@/hooks/useReservationSync';
import { formatEventCardDate } from '@/utils/dateFormatters';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** "14:32" style countdown to the hold expiry */
function useCountdown(expiresAt: number | null): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const secs = Math.max(0, Math.floor(expiresAt - now / 1000));
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((state) => state.cart.items);
  const reservation = useAppSelector((state) => state.cart.reservation);
  const countdown = useCountdown(
    reservation?.status === 'holding' ? reservation.expiresAt : null
  );

  // Esc closes; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const total = reservation?.priceTotal ?? cartTotal(items);
  const currency = items[0]?.currency ?? 'GBP';
  const holding = reservation?.status === 'holding';

  // Portalled to <body> — a fixed-position element inside an ancestor with
  // backdrop-filter (the sticky header uses backdrop-blur) gets contained
  // within that ancestor's box instead of the viewport, which shrank the
  // whole drawer down to the header's height
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-ink/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-display text-xl font-bold">Your tickets</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Hold status */}
        {items.length > 0 && (
          <div className="border-b border-gray-100 px-6 py-3">
            {holding && countdown && (
              <span className="chip bg-ocean-50 text-ocean-700">
                Tickets held for {countdown}
              </span>
            )}
            {reservation?.status === 'syncing' && (
              <span className="chip bg-gray-100 text-ink-soft">
                Securing your tickets…
              </span>
            )}
            {reservation?.status === 'expired' && (
              <span className="flex items-center gap-3">
                <span className="chip bg-gold-50 text-gold-700">
                  Hold expired
                </span>
                <button
                  onClick={requestResecure}
                  className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
                >
                  Re-secure tickets
                </button>
              </span>
            )}
            {reservation?.status === 'error' && (
              <span className="flex items-center gap-3">
                <span className="chip bg-red-50 text-red-700">
                  {reservation.errorMessage ?? 'Could not hold tickets'}
                </span>
                <button
                  onClick={requestResecure}
                  className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
                >
                  Retry
                </button>
              </span>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-lg font-bold">
                Your cart is empty
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Find a match and pick your tickets.
              </p>
              <Link
                to="/fixtures"
                onClick={onClose}
                className="btn-secondary mt-6"
              >
                Browse fixtures
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.ticketOptionId} className="py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/event/${item.productId}/${item.slug}`}
                        onClick={onClose}
                        className="font-display font-bold leading-snug hover:text-ocean-600"
                      >
                        {item.eventName}
                      </Link>
                      <p className="mt-0.5 text-sm text-ink-muted">
                        {formatEventCardDate(item.eventDate)} ·{' '}
                        {item.ticketName}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        dispatch(
                          removeFromCart({ ticketOptionId: item.ticketOptionId })
                        )
                      }
                      className="text-sm text-ink-muted hover:text-red-600"
                      aria-label={`Remove ${item.ticketName}`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-gray-200">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              ticketOptionId: item.ticketOptionId,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              ticketOptionId: item.ticketOptionId,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        disabled={item.quantity >= item.maxQty}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-display font-bold">
                      £{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  {item.quantity >= item.maxQty && (
                    <p className="mt-1.5 text-xs text-ink-muted">
                      Max {item.maxQty} per order
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5">
            <div className="flex justify-between font-display text-xl font-bold">
              <span>Total</span>
              <span>
                {currency === 'GBP' ? '£' : `${currency} `}
                {total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
              disabled={!holding}
              className="btn-primary mt-4 w-full"
            >
              {holding ? 'Checkout' : 'Securing tickets…'}
            </button>
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
