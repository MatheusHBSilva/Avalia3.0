const express = require('express');
const {idQueryRestaurant, validateSubmitReview} = require('../middlewares/restaurantMiddlewares');
const router  = express.Router();
const {
  getReviews,
  submitReview
} = require('../controllers/reviewController');

// GET  /api/reviews
router.get('/reviews',idQueryRestaurant, getReviews);

// POST /api/reviews
router.post('/reviews', validateSubmitReview, submitReview);

module.exports = router;
