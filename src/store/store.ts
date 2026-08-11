import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { type CartState } from './slices/cartSlice';
import userReducer from './slices/userSlice';

const CART_STORAGE_KEY = 'tc_cart';

/**
 * Rehydrate the cart from localStorage. A persisted hold whose expires_at
 * has passed comes back as 'expired' so the UI offers to re-secure.
 */
function loadCart(): CartState | undefined {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return undefined;
    const cart = JSON.parse(raw) as CartState;
    if (
      cart.reservation?.expiresAt &&
      cart.reservation.expiresAt * 1000 <= Date.now()
    ) {
      cart.reservation = { ...cart.reservation, number: null, status: 'expired' };
    }
    return cart;
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
  },
  preloadedState: (() => {
    const cart = loadCart();
    return cart ? { cart } : undefined;
  })(),
  devTools: import.meta.env.DEV,
});

// Persist the cart across reloads
store.subscribe(() => {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(store.getState().cart)
    );
  } catch {
    /* storage full/unavailable — cart just won't persist */
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
