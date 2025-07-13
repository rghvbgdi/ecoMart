import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_URL = `${API_BASE_URL}/api/orders`;

export const createOrder = async ({ productId, userId, shippingAddress }) => {
  return axios.post(`${API_URL}/create`, { productId, userId, shippingAddress }, { withCredentials: true });
};

export const cancelOrder = async (orderId) => {
  return axios.post(`${API_URL}/cancel`, { orderId }, { withCredentials: true });
};

export const getCancelledOrders = async () => {
  const res = await axios.get(`${API_URL}/cancelled`, { withCredentials: true });
  return res.data;
};

export const getNormalOrders = async () => {
  const res = await axios.get(`${API_URL}/normal`, { withCredentials: true });
  return res.data;
};

export const getOrdersByUserId = async (userId) => {
  const res = await axios.get(`${API_URL}/user/${userId}`, { withCredentials: true });
  return res.data;
};

export const getOrderById = async (orderId) => {
  const res = await axios.get(`${API_URL}/${orderId}`, { withCredentials: true });
  return res.data;
};


