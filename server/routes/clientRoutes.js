const express = require('express');
const router = express.Router();
const {validateRegisterClient, validateGetClient} = require('../middlewares/clientMiddlewares');
const { registerClient, getCurrentClient } = require('../controllers/clientController');

// POST /api/register-client
router.post('/register-client', validateRegisterClient, registerClient);

// GET /api/client-me
router.get('/client-me', validateGetClient,     getCurrentClient);

module.exports = router;
