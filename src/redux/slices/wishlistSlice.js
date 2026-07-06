import { createSlice } from '@reduxjs/toolkit';

const initialWishlist = localStorage.getItem('wishlist')
  ? JSON.parse(localStorage.getItem('wishlist'))
  : [];

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: initialWishlist
  },
  reducers: {
    addToWishlist: (state, action) => {
      const exists = state.items.some(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    }
  }
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
