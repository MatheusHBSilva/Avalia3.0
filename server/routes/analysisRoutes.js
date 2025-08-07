const express = require('express');
const router = express.Router();

// 1. Importa o controller e o middleware necessários.
const analysisController = require('../controllers/analysisController');
const { idCookieRestaurant } = require('../middlewares/restaurantMiddlewares');

// 2. Cria a rota POST para /analysis.
//    - O middleware 'idCookieRestaurant' protege a rota, garantindo que o usuário está logado.
//    - A rota chama a função 'businessAnalysis' que existe no seu controller.
router.post('/analysis', idCookieRestaurant, analysisController.businessAnalysis);

module.exports = router;