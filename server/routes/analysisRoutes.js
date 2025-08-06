const express = require('express');
const router = express.Router();
const { idBodyRestaurant } = require('../middlewares/restaurantMiddlewares');
const { businessAnalysis } = require('../controllers/analysisController');

// POST /api/business-analysis
router.post('/business-analysis', idBodyRestaurant, businessAnalysis);

module.exports = router;
