const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { userAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/unsold', productController.getUnsoldProducts);
router.get('/sold', productController.getSoldProducts);
router.get('/:id', productController.getProductById);


// Seller-only routes (TODO: Add seller role check middleware)
// router.post('/', userAuth, productController.createProduct);

module.exports = router;
