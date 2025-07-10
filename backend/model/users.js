const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "user"
  },
 
  greenCoins: {
    type: Number,
    default: 0 // Track user's green coins
  },

  carbonFootprintSaved: {
    type: Number,
    default : 0,
  },// Track green deals purchased for leaderboard/analytics
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
