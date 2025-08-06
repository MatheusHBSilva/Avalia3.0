const express = require('express');
const router = express.Router();
const { idBodyRestaurant } = require('../middlewares/restaurantMiddlewares');
const { validateGetClient } = require('../middlewares/clientMiddlewares');
const { clientRecommendation } = require('../controllers/recommendationController');

// POST /api/client-recommendation
router.post('/client-recommendation', idBodyRestaurant, validateGetClient, clientRecommendation);

module.exports = router;
