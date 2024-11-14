const mongoose = require('mongoose');
const App = require('../models/appModel'); // Import the App model
const Customer = require('../models/customerModel'); // Import the Customer model
const Payment = require('../models/paymentModel'); // Import the Payment model

// Get app-specific customer data
exports.getAppReport = async (req, res) => {
  const { appName } = req.params;

  try {
    // Find the app by name and get its ObjectId
    const app = await App.findOne({ name: appName });
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    // Ensure the app ID is a valid ObjectId
    const appId = app._id;

    // Find all customers associated with the app ID
    const customers = await Customer.find({ 'apps.app': appId });

    if (!customers.length) {
      return res.status(404).json({ message: 'No customers found for this app' });
    }

    // Calculate total usage and total payments
    let totalUsage = 0;
    let totalPayments = 0;
    let paymentHistory = [];

    // Fetch payments associated with the app ID
    const payments = await Payment.find({ app: appId });

    customers.forEach((customer) => {
      totalUsage += customer.totalApiCalls || 0;

      // Aggregate payments for each customer
      payments.forEach((payment) => {
        if (payment.customer.toString() === customer._id.toString()) {
          totalPayments += payment.totalPaymentAmount || 0;
          paymentHistory.push({
            date: payment.packageStartDate,
            amount: payment.totalPaymentAmount,
            status: payment.stripePaymentDetails[0]?.status || 'N/A',
            customerName: customer.name,
          });
        }
      });
    });

    // Send app-specific data
    res.status(200).json({
      appName,
      customerCount: customers.length,
      totalUsage,
      totalPayments,
      paymentHistory,
    });
  } catch (error) {
    console.error('Error fetching app report:', error);
    res.status(500).json({ message: 'Error fetching report data', error });
  }
};
