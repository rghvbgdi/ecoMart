const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { userAuth } = require('../middleware/authMiddleware');


router.use(userAuth);
router.post('/create', orderController.createOrder);
router.post('/cancel', orderController.cancelOrder);
router.get('/cancelled', orderController.getCancelledOrders);
router.get('/normal', orderController.getNormalOrders);
router.get('/user', orderController.getUserOrders);
router.get('/user/:userId', orderController.getOrdersByUserId);
router.get('/:orderId', orderController.getOrderById);


module.exports = router;
