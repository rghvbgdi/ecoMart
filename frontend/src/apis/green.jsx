import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_URL = `${API_BASE_URL}/api/green`;

export const createGreenOrder = async ({ customerId, productId, shippingAddress }) => {
  return axios.post(`${API_URL}/order`, { customerId, productId, shippingAddress }, { withCredentials: true });
};

export const getGreenOrders = async () => {
  const res = await axios.get(`${API_URL}/orders`, { withCredentials: true });
  return res.data;
};

export const getGreenOrderById = async (orderId) => {
  const res = await axios.get(`${API_URL}/orders/${orderId}`, { withCredentials: true });
  return res.data;
};

export const getGreenProducts = async () => {
  const res = await axios.get(`${API_URL}/products`, { withCredentials: true });
  return res.data;
};

export const getGreenProductById = async (id) => {
  const res = await axios.get(`${API_URL}/products/${id}`, { withCredentials: true });
  return res.data;
};

export const getSoldGreenProducts = async () => {
  const res = await axios.get(`${API_URL}/products/sold`, { withCredentials: true });
  return res.data;
};

export const getEnvironmentalImpact = async ({ greenProductId, userLocation }) => {
  const res = await axios.post(`${API_BASE_URL}/api/environmental/impact`, { greenProductId, userLocation }, { withCredentials: true });
  return res.data;
};

export const getNearbyGreenProducts = async (userLocation) => {
  const res = await axios.get(`${API_URL}/products/nearby?userLocation=${encodeURIComponent(userLocation)}`, { withCredentials: true });
  return res.data;
};
