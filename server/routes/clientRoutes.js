const express = require('express');
const router = express.Router();
const {validateRegisterClient, validateGetClient, validateUpdateClientTags} = require('../middlewares/clientMiddlewares'); // Adicione validateUpdateClientTags
const { registerClient, getCurrentClient, updateClientTags } = require('../controllers/clientController'); // Adicione updateClientTags

// POST /api/register-client
router.post('/register-client', validateRegisterClient, registerClient);

// GET /api/client-me
router.get('/client-me', validateGetClient, getCurrentClient);

// POST /api/update-client-tags
router.post('/update-client-tags', validateUpdateClientTags, updateClientTags); // Nova rota

module.exports = router;