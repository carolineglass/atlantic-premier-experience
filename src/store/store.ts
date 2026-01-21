import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';

/**
 * Redux store configuration
 * Combines all slices and enables Redux DevTools
 */
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
  },
  // Redux DevTools are enabled by default in development
  devTools: import.meta.env.DEV,
});

// TypeScript types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
