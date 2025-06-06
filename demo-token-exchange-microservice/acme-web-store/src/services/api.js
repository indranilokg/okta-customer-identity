import { STORE_SERVICE_URL } from '../config/services';
import axios from 'axios';

// Create axios instance for store service
const storeApi = axios.create({
  baseURL: STORE_SERVICE_URL
});

// Add auth token to requests
const addAuthToken = (config) => {
  const token = localStorage.getItem('okta-token-storage');
  if (token) {
    try {
      const parsedToken = JSON.parse(token);
      if (parsedToken.accessToken?.accessToken) {
        config.headers.Authorization = `Bearer ${parsedToken.accessToken.accessToken}`;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  return config;
};

// Add auth token to store service requests
storeApi.interceptors.request.use(addAuthToken);

// Store Service API calls
export const storeApiService = {
  getProducts: () => storeApi.get('/api/products'),
  getProduct: (id) => storeApi.get(`/api/products/${id}`),
  createOrder: (orderData) => storeApi.post('/api/orders', orderData),
  getOrders: () => storeApi.get('/api/orders'),
  getOrder: (id) => storeApi.get(`/api/orders/${id}`)
}; 