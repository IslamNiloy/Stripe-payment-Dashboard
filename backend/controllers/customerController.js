const Customer = require('../models/customerModel');
const Payment = require('../models/paymentModel');
const Product = require('../models/productModel'); // Ensure Product model is imported

// Get customers by app name
exports.getCustomersByApp = async (req, res) => {
  const { appId } = req.params; // Expect appId from the frontend

  try {
    // Find all customers who have subscribed to the specified app by appId
    const customers = await Customer.find({ 'apps.app': appId })
      .populate('apps.app')
      .populate('apps.product');

    if (!customers || customers.length === 0) {
      return res.status(404).json({ message: 'No customers found for this app' });
    }

    // Prepare customer data and include payment and product details
    const customerData = await Promise.all(
      customers.map(async (customer) => {
        // Fetch payment details for the customer
        const payments = await Payment.find({ customer: customer._id });

        // Map payment details
        const paymentHistory = payments.map((payment) => ({
          totalPaymentAmount: payment.totalPaymentAmount,
          lastPaymentAmount: payment.lastPaymentAmount,
          packageStartDate: payment.packageStartDate,
          packageEndDate: payment.packageEndDate,
          stripePaymentDetails: payment.stripePaymentDetails,
          isSubscription: payment.isSubscription,
          subscriptionId: payment.subscriptionId,
        }));

        // Extract app and product details for API limits
        const apps = customer.apps.map((app) => ({
          appName: app.app.name,
          productName: app.product.name,
          productType: app.product.productType,
          packagePrice: app.packagePrice,
          installationDate: app.installationDate,
          subscriptionId: app.subscriptionId,
          limit: app.product.limit, // API call limit from the product
          availableLimit: app.product.limit - customer.totalApiCalls, // Calculate available limit
        }));

        return {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          portalId: customer.portalId, // Add portal ID
          paymentStatus: customer.paymentStatus,
          isSubscribed: customer.isSubscribed,
          totalApiCalls: customer.totalApiCalls,
          monthlyApiCalls: customer.monthlyApiCalls,
          apps,
          paymentHistory,
        };
      })
    );

    res.status(200).json(customerData);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error });
  }
};

