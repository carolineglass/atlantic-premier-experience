import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OrderConfirmation } from '@/types/booking';

/**
 * Shopping cart backed by TC reservations: whenever items change, a
 * reservation is (re)created via useReservationSync to hold the tickets
 * until expires_at. Confirming the reservation at checkout places the
 * booking.
 */

export interface CartItem {
  productId: number;
  /** Unique per ticket category — the cart line key */
  ticketOptionId: number;
  eventName: string;
  /** ISO string of kickoff, for display */
  eventDate: string;
  /** Event URL slug for linking back */
  slug: string;
  ticketName: string;
  price: number;
  currency: string;
  quantity: number;
  maxQty: number;
  /** Needed for the direct-order fallback (see reservations.ts) */
  deliveryMethodId: number;
}

export type ReservationStatus = 'holding' | 'syncing' | 'expired' | 'error';

export interface ReservationState {
  number: string | null;
  /** UNIX epoch seconds */
  expiresAt: number | null;
  /** Server-priced total for the held tickets */
  priceTotal: number | null;
  status: ReservationStatus;
  errorMessage?: string;
}

export interface CartState {
  items: CartItem[];
  reservation: ReservationState | null;
  lastOrder: OrderConfirmation | null;
}

const initialState: CartState = {
  items: [],
  reservation: null,
  lastOrder: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) => item.ticketOptionId === action.payload.ticketOptionId
      );
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + action.payload.quantity,
          existing.maxQty
        );
      } else {
        state.items.push(action.payload);
      }
    },

    removeFromCart: (state, action: PayloadAction<{ ticketOptionId: number }>) => {
      state.items = state.items.filter(
        (item) => item.ticketOptionId !== action.payload.ticketOptionId
      );
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ ticketOptionId: number; quantity: number }>
    ) => {
      const item = state.items.find(
        (i) => i.ticketOptionId === action.payload.ticketOptionId
      );
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(
          (i) => i.ticketOptionId !== action.payload.ticketOptionId
        );
      } else {
        item.quantity = Math.min(action.payload.quantity, item.maxQty);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.reservation = null;
    },

    reservationSyncStarted: (state) => {
      state.reservation = {
        number: state.reservation?.number ?? null,
        expiresAt: state.reservation?.expiresAt ?? null,
        priceTotal: state.reservation?.priceTotal ?? null,
        status: 'syncing',
      };
    },

    reservationSecured: (
      state,
      action: PayloadAction<{
        number: string;
        expiresAt: number;
        priceTotal: number;
      }>
    ) => {
      state.reservation = {
        number: action.payload.number,
        expiresAt: action.payload.expiresAt,
        priceTotal: action.payload.priceTotal,
        status: 'holding',
      };
    },

    reservationExpired: (state) => {
      if (state.reservation) {
        state.reservation.status = 'expired';
        state.reservation.number = null;
      }
    },

    reservationFailed: (state, action: PayloadAction<string>) => {
      state.reservation = {
        number: null,
        expiresAt: null,
        priceTotal: null,
        status: 'error',
        errorMessage: action.payload,
      };
    },

    orderPlaced: (state, action: PayloadAction<OrderConfirmation>) => {
      state.lastOrder = action.payload;
      // The reservation is consumed by the confirm call
      state.items = [];
      state.reservation = null;
    },
  },
});

export const cartTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  reservationSyncStarted,
  reservationSecured,
  reservationExpired,
  reservationFailed,
  orderPlaced,
} = cartSlice.actions;
export default cartSlice.reducer;
