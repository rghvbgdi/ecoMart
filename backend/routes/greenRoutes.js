const express = require('express');
const router = express.Router();
const greenController = require('../controllers/greenController');

router.post('/order', greenController.createGreenOrder);
router.get('/orders', greenController.getGreenOrders);
router.get('/products', greenController.getGreenProducts);
router.get('/products/:id', greenController.getGreenProductById);
router.get('/soldproducts', greenController.getSoldGreenProducts);
router.get('/products/sold', require('../controllers/greenController').getSoldGreenProducts);
module.exports = router;


