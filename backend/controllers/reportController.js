// controllers/reportController.js
const StripePayment = require('../models/stripeModel');

// Get app-specific customer data
exports.getAppReport = async (req, res) => {
    const { appName } = req.params;

    try {
        // Find all customers for the specific app
        const customers = await StripePayment.find({ appName });

        if (!customers.length) {
            return res.status(404).json({ message: 'No customers found for this app' });
        }

        // Calculate total usage and total payments
        let totalUsage = 0;
        let totalPayments = 0;
        let paymentHistory = [];

        customers.forEach(customer => {
            totalUsage += customer.usage.apiCalls || 0;

            customer.payments.forEach(payment => {
                totalPayments += payment.amount;
                paymentHistory.push({
                    date: payment.createdAt,
                    amount: payment.amount,
                    status: payment.status,
                    customerName: customer.customerDetails.name
                });
            });
        });

        // Send app-specific data
        res.status(200).json({
            appName,
            customerCount: customers.length,
            totalUsage,
            totalPayments,
            paymentHistory
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching report data', error });
    }
};
