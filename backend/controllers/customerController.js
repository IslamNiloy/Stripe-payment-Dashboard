// controllers/customerController.js

const StripePayment = require('../models/stripeModel');


// Get customers by app name
exports.getCustomersByApp = async (req, res) => {
  const { appName } = req.params;
  try {
    // Find customers associated with the specified app name
    const customers = await StripePayment.find({ appName });

    if (!customers || customers.length === 0) {
      return res.status(404).json({ message: 'No customers found for this app' });
    }

    // Map customer data to the required format
    const customerData = customers.map((customer) => ({
      id: customer._id,
      name: customer.customerDetails?.name || 'N/A',
      email: customer.customerDetails?.email || 'N/A',
      totalPayments: customer.payments
        ? customer.payments.reduce((acc, payment) => acc + payment.amount, 0)
        : 0,
      usage: customer.usage?.apiCalls || 0,
      lastChargedDate: customer.usage?.lastChargedDate
        ? new Date(customer.usage.lastChargedDate).toLocaleDateString()
        : 'No date available',
      paymentHistory: customer.payments || [],
    }));

    res.status(200).json(customerData);
  } catch (error) {
    console.error('Error fetching customers:', error); // Log detailed error
    res.status(500).json({ message: 'Error fetching customers', error });
  }
};
