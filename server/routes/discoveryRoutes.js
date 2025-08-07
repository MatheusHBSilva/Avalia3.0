const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discoveryController');

// Define a rota GET para /discovery
// A junção com o server.js cria o caminho completo que o frontend espera: GET /api/discovery
router.get('/discovery', discoveryController.getDiscoveryFeed);

module.exports = router;