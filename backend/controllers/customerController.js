// controllers/customerController.js

const StripePayment = require('../models/stripeModel');


// Get customers by app name
exports.getCustomersByApp = async (req, res) => {
    const { appName } = req.params;
    try {
      const customers = await StripePayment.find({ appName });
  
      if (!customers.length) {
        return res.status(404).json({ message: 'No customers found for this app' });
      }
  
      const customerData = customers.map((customer) => ({
        id: customer._id,
        name: customer.customerDetails.name,
        email: customer.customerDetails.email,
        totalPayments: customer.payments.reduce((acc, payment) => acc + payment.amount, 0),
        usage: customer.usage.apiCalls,
        lastChargedDate: customer.usage.lastChargedDate,
        paymentHistory: customer.payments,
      }));
  
      res.status(200).json(customerData);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching customers', error });
    }
  };
  