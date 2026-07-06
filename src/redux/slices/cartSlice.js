import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    appliedCoupon: null, // format: { code: 'ECO10', discountPercent: 10 }
    loading: false,
    error: null,
  },
  reducers: {
    cartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    cartSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload;
    },
    cartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addToCartLocal: (state, action) => {
      const existing = state.items.find(item => item.product_id === action.payload.product_id);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
          saved_for_later: false
        });
      }
    },
    updateQuantityLocal: (state, action) => {
      const { product_id, quantity } = action.payload;
      const item = state.items.find(item => item.product_id === product_id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    toggleSaveForLaterLocal: (state, action) => {
      const { product_id } = action.payload;
      const item = state.items.find(item => item.product_id === product_id);
      if (item) {
        item.saved_for_later = !item.saved_for_later;
      }
    },
    removeFromCartLocal: (state, action) => {
      state.items = state.items.filter(item => item.product_id !== action.payload);
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload; // action.payload = { code: 'SEED15', discountPercent: 15 }
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.appliedCoupon = null;
    }
  }
});

export const {
  cartStart,
  cartSuccess,
  cartFailure,
  addToCartLocal,
  updateQuantityLocal,
  toggleSaveForLaterLocal,
  removeFromCartLocal,
  applyCoupon,
  removeCoupon,
  clearCartLocal
} = cartSlice.actions;

export default cartSlice.reducer;
