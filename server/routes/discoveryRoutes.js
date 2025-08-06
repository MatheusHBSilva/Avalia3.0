const express = require('express');
const router = express.Router();

// Importa o novo controller
const discoveryController = require('../controllers/discoveryController');

// Define a rota GET para o feed de descoberta.
// O frontend chamará GET /api/discovery
router.get('/', discoveryController.getDiscoveryFeed);

module.exports = router;