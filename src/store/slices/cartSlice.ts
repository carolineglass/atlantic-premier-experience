import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Shopping cart slice for managing ticket selections and checkout
 */

export interface CartItem {
  productId: number;
  eventName: string; // e.g., "Manchester United vs Liverpool"
  eventDate: string; // ISO string
  seatSection: string;
  quantity: number;
  pricePerTicket: number;
  slug: string; // For navigation back to event
}

interface CartState {
  items: CartItem[];
  total: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
};

/**
 * Calculate total from cart items
 */
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.pricePerTicket * item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.seatSection === action.payload.seatSection
      );

      if (existingItem) {
        // Update quantity if same product and section
        existingItem.quantity += action.payload.quantity;
      } else {
        // Add new item
        state.items.push(action.payload);
      }

      state.total = calculateTotal(state.items);
    },

    removeFromCart: (
      state,
      action: PayloadAction<{ productId: number; seatSection: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.seatSection === action.payload.seatSection
          )
      );
      state.total = calculateTotal(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; seatSection: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.seatSection === action.payload.seatSection
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          // Remove if quantity is 0 or negative
          state.items = state.items.filter(
            (i) =>
              !(
                i.productId === action.payload.productId &&
                i.seatSection === action.payload.seatSection
              )
          );
        } else {
          item.quantity = action.payload.quantity;
        }
        state.total = calculateTotal(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
