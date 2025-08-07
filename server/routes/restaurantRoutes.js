const express = require('express');
const router  = express.Router();
const {idCookieRestaurant, validateGetTag, validateRegisterRestaurant, validateUpdateRestaurantTags} = require('../middlewares/restaurantMiddlewares');
const {
  registerRestaurant,
  getRestaurants,
  getRestaurantTags,
  updateRestaurantTags,
  getMe // <<-- Importando a nova função
} = require('../controllers/restaurantController');

// POST   /api/register
router.post('/register', validateRegisterRestaurant, registerRestaurant);

// GET    /api/restaurant/me  <-- ROTA CORRIGIDA
// Esta rota agora corresponde exatamente à chamada do frontend e usa a nova função getMe.
router.get('/restaurant/me', idCookieRestaurant, getMe);

// GET    /api/restaurants
router.get('/restaurants', getRestaurants);

// GET    /api/restaurant-tags
router.get('/restaurant-tags', validateGetTag, getRestaurantTags);

// POST   /api/update-restaurant-tags
router.post('/update-restaurant-tags', validateUpdateRestaurantTags, updateRestaurantTags);

module.exports = router;