import axios from 'axios';

const API_URL = '/api/green';

export const createGreenOrder = async ({ customerId, productId, shippingAddress }) => {
  return axios.post(`${API_URL}/order`, { customerId, productId, shippingAddress });
};

export const getGreenOrders = async () => {
  const res = await axios.get(`${API_URL}/orders`);
  return res.data;
};

export const getGreenProducts = async () => {
  const res = await axios.get(`${API_URL}/products`);
  return res.data;
};

export const getSoldGreenProducts = async () => {
  const res = await axios.get('/api/green/products/sold');
  return res.data;
};
