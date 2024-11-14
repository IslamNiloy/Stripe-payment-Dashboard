// routes/customerRoutes.js
const express = require('express');
const  customerController  = require('../controllers/customerController');

const router = express.Router();

// Route to get customers by app name
router.get('/app/:appId/customers', customerController.getCustomersByApp);

module.exports = router;
