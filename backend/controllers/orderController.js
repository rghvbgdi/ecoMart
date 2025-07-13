const Order = require('../model/orders');
const Product = require('../model/products');
const GreenProduct = require('../model/greenproduct');
const mongoose = require('mongoose');

// Helper: 7 warehouse locations in India
const warehouseLocations = [
  { latitude: 28.6139, longitude: 77.2090 }, // Delhi
];

// 1. Create normal order
exports.createOrder = async (req, res) => {
  try {
    const { productId, userId, shippingAddress } = req.body;
    if (!productId || !userId || !shippingAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Mark product as sold
    const product = await Product.findByIdAndUpdate(productId, { isSold: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Create order
    const order = new Order({
      customerId: userId,
      product: { productId },
      shippingAddress
    });
    await order.save();
    

    
    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

// 2. Cancel order and create green product
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Order ID required' });
    // Find order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.isCancelled) return res.status(400).json({ message: 'Order already cancelled' });
    // Mark order as cancelled
    order.isCancelled = true;
    await order.save();
   
    // Pick random warehouse location
    const location = warehouseLocations[Math.floor(Math.random() * warehouseLocations.length)];
    // Create green product
    const greenProduct = new GreenProduct({
      productId: order.product.productId,
      warehouseLocation: location,
      carbonFootprint: 4,
      greenCoins: Math.floor(Math.random() * 50) + 1,
      isSold: false
    });
    await greenProduct.save();
    res.status(200).json({ message: 'Order cancelled and green product(s) created' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order', error: err.message });
  }
};

// Get all cancelled orders
exports.getCancelledOrders = async (req, res) => {
  try {
    const cancelledOrders = await Order.find({ isCancelled: true });
    res.status(200).json(cancelledOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cancelled orders', error: err.message });
  }
};

// Get all orders for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ customerId: userId }).populate('product.productId');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user orders', error: err.message });
  }
};

// Get all orders for a particular user by userId (admin or internal use)
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const orders = await Order.find({ customerId: userId }).populate('product.productId');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user orders', error: err.message });
  }
};

// Get all normal (non-green, non-cancelled) orders
exports.getNormalOrders = async (req, res) => {
  try {
    const normalOrders = await Order.find({ isGreenProduct: false, isCancelled: false });
    res.status(200).json(normalOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching normal orders', error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ message: 'Order ID required' });
    
    const order = await Order.findById(orderId).populate('product.productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    

    
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};
