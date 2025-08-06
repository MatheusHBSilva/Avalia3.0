const express = require('express');
const router  = express.Router();
const { validateGetClient } = require('../middlewares/clientMiddlewares');
const {
  getFavoriteIds,
  toggleFavorite,
  getFavoriteRestaurants
} = require('../controllers/favoriteController');

// GET  /api/favorites
router.get('/favorites', validateGetClient, getFavoriteIds);

// POST /api/favorites
router.post('/favorites', toggleFavorite);

// GET  /api/favorites/restaurants
router.get('/favorites/restaurants', validateGetClient, getFavoriteRestaurants);

module.exports = router;
