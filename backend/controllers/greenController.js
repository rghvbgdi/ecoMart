const Order = require('../model/orders');
const Product = require('../model/products');
const GreenProduct = require('../model/greenproduct');
const User = require('../model/users');
const mongoose = require('mongoose');

// Helper: 7 warehouse locations in India
const warehouseLocations = [
  { latitude: 28.6139, longitude: 77.2090 }, // Delhi
  { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
  { latitude: 13.0827, longitude: 80.2707 }, // Chennai
  { latitude: 22.5726, longitude: 88.3639 }, // Kolkata
  { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
  { latitude: 17.3850, longitude: 78.4867 }, // Hyderabad
  { latitude: 23.0225, longitude: 72.5714 }  // Ahmedabad
];

// Create green order
exports.createGreenOrder = async (req, res) => {
  try {
    const { customerId, productId, shippingAddress } = req.body;
    if (!customerId || !productId || !shippingAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Find green product
    const greenProduct = await GreenProduct.findOne({ productId, isSold: false });
    if (!greenProduct) return res.status(404).json({ message: 'Green product not available' });
    // Mark green product as sold
    greenProduct.isSold = true;
    await greenProduct.save();
    // Mark original product as sold
    await Product.findByIdAndUpdate(productId, { isSold: true });
    // Update user's greenCoins and carbonFootprintSaved
    
    console.log('Updating user:', customerId, 'with coins:', greenProduct.greenCoins, 'and CO2:', greenProduct.carbonFootprint);
    const updateResult = await User.findByIdAndUpdate(
      customerId,
      {
        $inc: {
          greenCoins: greenProduct.greenCoins,
          carbonFootprintSaved: greenProduct.carbonFootprint
        }
      }
    );
    console.log('Update result:', updateResult);
    // Create order (isGreenProduct: true)
    const order = new Order({
      customerId,
      product: { productId },
      shippingAddress,
      isGreenProduct: true
    });
    await order.save();
    res.status(201).json({ message: 'Green order created', order });
  } catch (err) {
    res.status(500).json({ message: 'Error creating green order', error: err.message });
  }
};

// Get all green orders
exports.getGreenOrders = async (req, res) => {
  try {
    const greenOrders = await Order.find({ isGreenProduct: true });
    res.status(200).json(greenOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching green orders', error: err.message });
  }
};

// Get all unsold green products
exports.getGreenProducts = async (req, res) => {
  try {
    const greenProducts = await GreenProduct.find({ isSold: false }).populate('productId');
    res.status(200).json(greenProducts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching green products', error: err.message });
  }
};
//get sold green products
exports.getSoldGreenProducts = async (req, res) => {
  try {
    const soldGreenProducts = await GreenProduct.find({ isSold: true }).populate('productId');
    res.status(200).json(soldGreenProducts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sold green products', error: err.message });
  }
};
  
