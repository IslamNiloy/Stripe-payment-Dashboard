// routes/customerRoutes.js
const express = require('express');
const { getCustomersByApp } = require('../controllers/customerController');

const router = express.Router();

// Route to get customers by app name
router.get('/app/:appName/customers', getCustomersByApp);

module.exports = router;
