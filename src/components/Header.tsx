import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import {
  CompetitionsMenu,
  MobileCompetitions,
} from './CompetitionsMenu';
import { CartDrawer } from './CartDrawer';

const NAV_ITEMS = [{ to: '/fixtures', label: 'Fixtures' }];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const cartButton = (
    <button
      onClick={() => setCartOpen(true)}
      className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
      aria-label={`Open cart (${itemCount} tickets)`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4h12.4M16 21a1 1 0 100-2 1 1 0 000 2zm-8 0a1 1 0 100-2 1 1 0 000 2z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tangerine-500 px-1 text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl font-bold tracking-tight"
          onClick={() => setMenuOpen(false)}
        >
          Atlantic
          <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[3px] bg-ocean-500" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-ink text-white'
                    : 'text-ink-soft hover:bg-gray-100 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <CompetitionsMenu />
          <Link
            to="/fixtures?focus=search"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-ocean-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Find tickets
          </Link>
          {cartButton}
        </nav>

        {/* Mobile: cart + menu buttons */}
        <div className="flex items-center gap-1 sm:hidden">
        {cartButton}
        <button
          className="rounded-full p-2 hover:bg-gray-100"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 py-3 sm:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 font-semibold ${
                  isActive ? 'bg-gray-100 text-ink' : 'text-ink-soft'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <MobileCompetitions onNavigate={() => setMenuOpen(false)} />
        </nav>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
