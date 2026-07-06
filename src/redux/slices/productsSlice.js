import { createSlice } from '@reduxjs/toolkit';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    selectedProduct: null,
    loading: false,
    error: null,
  },
  reducers: {
    productsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    productsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.products;
      state.totalCount = action.payload.total_count;
      state.currentPage = action.payload.page;
      state.totalPages = action.payload.pages;
    },
    productsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    productDetailStart: (state) => {
      state.loading = true;
      state.error = null;
      state.selectedProduct = null;
    },
    productDetailSuccess: (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
    },
    productDetailFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  productsStart,
  productsSuccess,
  productsFailure,
  productDetailStart,
  productDetailSuccess,
  productDetailFailure,
} = productsSlice.actions;

export default productsSlice.reducer;
