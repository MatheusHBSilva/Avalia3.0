const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { idCookieRestaurant } = require('../middlewares/restaurantMiddlewares'); // Middleware de segurança

// GET /api/reports -> Busca a lista de relatórios
router.get('/reports', idCookieRestaurant, reportController.getReportsHistory);

// GET /api/reports/:id -> Busca um relatório específico para gerar o PDF
// :id é um parâmetro dinâmico (ex: /api/reports/1, /api/reports/2)
router.get('/reports/:id', idCookieRestaurant, reportController.getReportById);

module.exports = router;