import axios from 'axios';

const API_URL = '/api/orders';

export const createOrder = async ({ productId, userId, shippingAddress }) => {
  return axios.post(`${API_URL}/create`, { productId, userId, shippingAddress });
};

export const cancelOrder = async (orderId) => {
  return axios.post(`${API_URL}/cancel`, { orderId });
};

export const getCancelledOrders = async () => {
  const res = await axios.get(`${API_URL}/cancelled`);
  return res.data;
};


