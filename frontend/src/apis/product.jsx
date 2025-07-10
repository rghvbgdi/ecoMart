// apis/product.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true
});

/**
 * Fetches all products.
 * Endpoint: /api/products
 * @returns {Promise<Array>} - A promise that resolves with an array of product objects.
 */
export const getAllProducts = async () => {
  try {
    const response = await API.get('/api/products');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches only unsold products.
 * Endpoint: /api/products/unsold
 * @returns {Promise<Array>} - A promise that resolves with an array of unsold product objects.
 */
export const getUnsoldProducts = async () => {
  try {
    const response = await API.get('/api/products/unsold');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSoldProducts = async () => {
  try {
    const response = await API.get('/api/products/sold');
    return response.data;
  } catch (error) {
    throw error;
  }
};
/**
 * Creates a new product (for seller).
 * Endpoint: /api/products (POST)
 * @param {object} productData - The product data to create.
 * @returns {Promise<object>} - A promise that resolves with the created product object.
 */
export const createProduct = async (productData) => {
  try {
    const response = await API.post('/api/products', productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await API.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
