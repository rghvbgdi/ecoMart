const Order = require('../model/orders');
const Product = require('../model/products');
const GreenProduct = require('../model/greenproduct');
const User = require('../model/users');
const mongoose = require('mongoose');
const axios = require('axios');

// Helper: 7 warehouse locations in India
const warehouseLocations = [
  { latitude: 28.6139, longitude: 77.2090 }, // Delhi
];

// Helper: Haversine formula (reuse your existing one)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};



const getUserLocationCoordinates = async (userLocation) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userLocation)}`;
    const response = await axios.get(url, { headers: { 'User-Agent': 'green-deals-app' } });
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
        name: userLocation
      };
    }
    // Fallback: Delhi
    return { lat: 28.6139, lng: 77.2090, name: userLocation || 'Unknown Location' };
  } catch (err) {
    // Fallback: Delhi
    return { lat: 28.6139, lng: 77.2090, name: userLocation || 'Unknown Location' };
  }
};

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

// Get green order by ID
exports.getGreenOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ message: 'Order ID required' });
    
    const order = await Order.findById(orderId).populate('product.productId');
    if (!order) {
      return res.status(404).json({ message: 'Green order not found' });
    }
    
    // Verify it's actually a green order
    if (!order.isGreenProduct) {
      return res.status(400).json({ message: 'This is not a green order' });
    }
    

    
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching green order', error: err.message });
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

// Get single green product by ID
exports.getGreenProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const greenProduct = await GreenProduct.findById(id).populate('productId');
    
    if (!greenProduct) {
      return res.status(404).json({ message: 'Green product not found' });
    }
    
    if (greenProduct.isSold) {
      return res.status(400).json({ message: 'This green product has already been sold' });
    }
    
    res.status(200).json(greenProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching green product', error: err.message });
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

exports.getNearbyGreenProducts = async (req, res) => {
  try {
    const { userLocation } = req.query;
    if (!userLocation) return res.status(400).json({ message: 'User location required' });

    const userCoords = await getUserLocationCoordinates(userLocation);

    if (!userCoords || !userCoords.lat || !userCoords.lng) {
      return res.status(400).json({ message: 'Could not determine user coordinates' });
    }

    const greenProducts = await GreenProduct.find({ isSold: false }).populate('productId');

    console.log('User location:', userLocation, userCoords);
    greenProducts.forEach(green => {
      const wh = green.warehouseLocation;
      const dist = calculateDistance(userCoords.lat, userCoords.lng, wh.latitude, wh.longitude);
      console.log('Green product:', green._id, 'Warehouse:', wh, 'Distance:', dist);
    });

    const filtered = greenProducts.filter(green => {
      const wh = green.warehouseLocation;
      const dist = calculateDistance(userCoords.lat, userCoords.lng, wh.latitude, wh.longitude);
      return dist <= 350;
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching nearby green products', error: err.message });
  }
};
  
