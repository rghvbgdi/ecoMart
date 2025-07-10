const mongoose = require('mongoose');

const greenproductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  carbonFootprint: { type: Number, required: true }, // e.g., kg CO2 saved
  greenCoins: { type: Number, required: true },
  isSold: { type: Boolean, default: false } // True if sold
});

module.exports = mongoose.model('GreenProduct', greenproductSchema);