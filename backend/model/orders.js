const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
  },
   
  shippingAddress: { type: String },
  isGreenProduct: { type: Boolean, default: false },
  isCancelled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
