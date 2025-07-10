// 1. Create a file in your 'routes' folder, e.g., 'routes/authRoutes.js'

// routes/authRoutes.js
const express = require('express');
const router = express.Router(); // Create an Express Router
const authController = require('../controllers/authController'); // Adjust path as needed
const { userAuth } = require('../middleware/authMiddleware');
// Define your authentication routes
// These paths are relative to where the router is 'use'd in your main app file
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
// Add a placeholder for forgot password, you'll need to implement authController.forgotPassword
router.get('/status', userAuth, authController.status);


module.exports = router;