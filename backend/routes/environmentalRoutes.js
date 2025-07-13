const express = require('express');
const router = express.Router();
const environmentalController = require('../controllers/environmentalController');

router.post('/impact', environmentalController.getEnvironmentalImpact);

module.exports = router; 