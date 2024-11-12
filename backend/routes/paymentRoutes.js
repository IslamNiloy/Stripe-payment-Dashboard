const express = require('express');
const router = express.Router();
const {
    processPayment,
    addPayAsYouGoCustomer,
    trackUsage, 
    chargePayAsYouGoCustomer, 
    handleStripeWebhook,
    createCheckoutSession
} = require('../controllers/paymentController');
const validateApiKey = require('../middlewares/apiKeyMiddleware'); // Adjust path if necessary

// Apply the API key validation middleware to all routes that require an API key
router.post('/charge', validateApiKey, processPayment);
router.post('/track-usage', validateApiKey, trackUsage);
router.post('/add-payg-customer', validateApiKey, addPayAsYouGoCustomer);
router.post('/charge-payg', validateApiKey, chargePayAsYouGoCustomer);
router.post('/create-checkout-session', validateApiKey, createCheckoutSession);

// Webhook route - does not require API key validation
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
