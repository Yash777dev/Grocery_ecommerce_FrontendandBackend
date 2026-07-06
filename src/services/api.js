import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage if token invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/login', { email, password });
    return res.data;
  },
  signup: async (email, password, name) => {
    const res = await api.post('/signup', { email, password, name });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/profile', data);
    return res.data;
  },
};

export const productService = {
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getProductDetails: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  addReview: async (productId, rating, comment) => {
    const res = await api.post(`/products/${productId}/reviews`, { rating, comment });
    return res.data;
  },
  upvoteReview: async (reviewId) => {
    const res = await api.post(`/reviews/${reviewId}/upvote`);
    return res.data;
  },
};

export const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },
  addToCart: async (productId, quantity, savedForLater = 0) => {
    const res = await api.post('/cart', { product_id: productId, quantity, saved_for_later: savedForLater ? 1 : 0 });
    return res.data;
  },
  removeFromCart: async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    return res.data;
  },
};

export const orderService = {
  placeOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },
};

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
};

export default api;
