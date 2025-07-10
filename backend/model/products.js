const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  origin: { type: String, default: 'USA' },
  isSold: { type: Boolean, default: false } // True if sold
});

module.exports = mongoose.model('Product', productSchema);
