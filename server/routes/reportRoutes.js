const express = require('express');
const { idQueryRestaurant } = require('../middlewares/restaurantMiddlewares');
const validateReportId = require('../middlewares/validateReportId');
const router = express.Router();
const {
  getReportHistory,
  downloadReport
} = require('../controllers/reportController');

// GET  /api/report-history
router.get('/report-history', idQueryRestaurant, getReportHistory);

// POST /api/download-report
router.post('/download-report', validateReportId, downloadReport);

module.exports = router;
