const express = require('express');
const router = express.Router();
const validateLogin = require('../middlewares/validateLogin');
const { login, logout } = require('../controllers/authController');

// POST /api/login
router.post('/login', validateLogin, login);

// POST /api/logout
router.post('/logout', logout);

module.exports = router;
