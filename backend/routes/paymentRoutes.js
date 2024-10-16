
const express = require('express');
const router = express.Router();
const {
    processPayment,
    addPayAsYouGoCustomer,
    trackUsage, 
    chargePayAsYouGoCustomer, 
    handleStripeWebhook ,
    createCheckoutSession
} = require('../controllers/paymentController');

router.post('/charge', processPayment);

router.post('/track-usage', trackUsage);

// Route to add a Pay-as-You-Go customer
router.post('/add-payg-customer', addPayAsYouGoCustomer);


// Route to manually charge a Pay-as-You-Go customer after 30 days
router.post('/charge-payg', chargePayAsYouGoCustomer);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
