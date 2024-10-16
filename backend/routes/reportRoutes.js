// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { getAppReport } = require('../controllers/reportController');

// Get report for a specific app
router.get('/app/:appName/report', getAppReport);

module.exports = router;
