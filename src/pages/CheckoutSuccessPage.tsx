import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export function CheckoutSuccessPage() {
  const order = useAppSelector((state) => state.cart.lastOrder);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">No recent booking</h1>
        <Link to="/fixtures" className="btn-secondary mt-8">
          Browse fixtures
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ocean-50 text-3xl">
        🎟️
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        You're going to the match
      </h1>
      <p className="mt-4 text-lg text-ink-muted">
        Booking confirmed. Keep your order number handy:
      </p>

      <div className="mx-auto mt-8 max-w-sm rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
        <p className="text-sm text-ink-muted">Order number</p>
        <p className="mt-1 font-display text-3xl font-bold tracking-tight">
          {order.order_no}
        </p>
        <p className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-sm">
          <span className="text-ink-muted">Total</span>
          <span className="font-display font-bold">
            {order.currency === 'GBP' ? '£' : `${order.currency} `}
            {order.total}
          </span>
        </p>
        <p className="mt-2 flex justify-between text-sm">
          <span className="text-ink-muted">Status</span>
          <span className="chip bg-gold-50 text-gold-700">
            Pending payment
          </span>
        </p>
      </div>

      <p className="mx-auto mt-6 max-w-md text-sm text-ink-muted">
        [PLACEHOLDER: What happens next — ticket delivery timeline and how
        payment is settled by invoice.]
      </p>

      <Link to="/fixtures" className="btn-primary mt-10">
        Browse more fixtures
      </Link>
    </div>
  );
}
