const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const StripePayment = require('../models/stripeModel');
const Product = require('../models/productModel');

// Process payment for a product
exports.processPayment = async (req, res) => {
    const { appName, productId, stripeToken, email, name, phone, countryCode } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Create a Stripe customer with additional info
        let customer = await stripe.customers.create({
            email,
            source: stripeToken,
            name, 
            phone, 
            address: {
                country: countryCode
            }
        });

        // Charge the customer
        const charge = await stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer: customer.id,
            description: `Payment for ${product.name}`
        });

        // Save payment information in MongoDB, including customer details
        const stripePayment = new StripePayment({
            stripeCustomerId: customer.id,
            appName,
            customerDetails: {
                name,
                email,
                phone,
                countryCode 
            },
            payments: [{
                productId,
                amount: product.price,
                status: charge.status,
                customerDetails: {
                    name: customer.name,
                    email:customer.email,
                    phone: customer.phone,
                    country: customer.address.country
                }
            }]
        });

        await stripePayment.save();
        res.status(201).json({ message: 'Payment successful', charge });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Track Pay-as-You-Go customer usage (e.g., API calls)
exports.trackUsage = async (req, res) => {
    const { appName, stripeCustomerId, apiCalls } = req.body;

    try {
        const stripePayment = await StripePayment.findOne({ stripeCustomerId, appName });
        if (!stripePayment) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Update API call usage
        stripePayment.usage.apiCalls += apiCalls;
        await stripePayment.save();

        res.status(200).json({ message: 'Usage updated', usage: stripePayment.usage });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Add a Pay-as-You-Go customer when they select the plan
exports.addPayAsYouGoCustomer = async (req, res) => {
    const { email, name, phone, country, stripeToken, productId, appName } = req.body;

    try {
        // Create a customer in Stripe
        const customer = await stripe.customers.create({
            email,
            source: stripeToken,  // Stripe token (use tok_visa for testing)
            name,
            phone,
            address: {
                country
            }
        });

        // Log customer creation success
        console.log('Customer created in Stripe:', customer);

        // Create a MongoDB record for StripePayment
        const newStripePayment = new StripePayment({
            stripeCustomerId: customer.id,
            appName,
            customerDetails: {
                name,
                email,
                phone,
                country 
            },
            usage: {
                apiCalls: 0, 
                lastChargedDate: new Date()
            },
            payments: [],
            productId 
        });

        // Save the record in MongoDB
        await newStripePayment.save();

        // Log MongoDB save success
        // console.log('StripePayment saved in MongoDB:', newStripePayment);

        res.status(201).json({ message: 'Pay-as-You-Go customer added', customer });
    } catch (error) {
        // Log the error if MongoDB save fails
        console.error('Error adding Pay-as-You-Go customer:', error);
        res.status(400).json({ error: error.message });
    }
};


// Charge customer based on usage after 30 days
exports.chargePayAsYouGoCustomer = async (req, res) => {
    const { stripeCustomerId, productId, appName } = req.body;

    try {
        // Find the customer and their usage
        const stripePayment = await StripePayment.findOne({ stripeCustomerId, appName });
        if (!stripePayment) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const usage = stripePayment.usage.apiCalls;

        // Find the product (Pay-as-You-Go) and its price
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Ensure that customerDetails are initialized
        const customerDetails = stripePayment.customerDetails || {
            name: "N/A",
            email:"N/A",
            phone: "N/A",
            country: "N/A",
        };

        // Calculate the amount to charge based on usage and product price
        const amountToCharge = usage * product.price;

        if (amountToCharge > 0) {
            // Create the charge in Stripe
            const charge = await stripe.charges.create({
                amount: amountToCharge * 100, // Convert to cents
                currency: 'usd',
                customer: stripePayment.stripeCustomerId,
                description: `Charge based on ${usage} API calls for ${product.name}`
            });

            // Save payment details with customer details
            stripePayment.payments.push({
                productId: product._id,
                amount: amountToCharge,
                status: charge.status,
                createdAt: new Date(),
                customerDetails: customerDetails  // Ensure customer details are saved with the payment
            });

            // Reset usage after charge
            stripePayment.usage.apiCalls = 0;
            stripePayment.usage.lastChargedDate = new Date();
            await stripePayment.save();

            res.status(200).json({
                message: 'Customer charged based on usage',
                charge,
                customerDetails  // Include customer details in the response
            });
        } else {
            res.status(200).json({ message: 'No usage to charge' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Stripe webhook handler
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(`Webhook received and verified: ${event.type}`);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('checkout.session.completed event received for session:', session);

        // Update the Payment model with the Stripe session details
        await Payment.findOneAndUpdate(
          { customer: session.metadata.customerId },
          {
            paymentStatus: 'completed',
            subscriptionId: session.subscription || null, // Set the subscription ID if available
            stripePaymentDetails: [
              {
                amount: session.amount_total / 100, // Convert cents to dollars
                status: session.payment_status,
                stripeCustomerId: session.customer,
                createdAt: new Date(session.created * 1000),
              },
            ],
          }
        );

        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('invoice.payment_succeeded event received for invoice:', invoice);

        // Update Payment model when an invoice is paid
        await Payment.findOneAndUpdate(
          { subscriptionId: invoice.subscription },
          {
            paymentStatus: 'completed',
            stripePaymentDetails: {
              $push: {
                amount: invoice.amount_paid / 100, // Convert cents to dollars
                status: 'succeeded',
                createdAt: new Date(invoice.created * 1000),
              },
            },
          }
        );

        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log(`${event.type} event received for subscription:`, subscription);

        // Update Customer and Payment models with subscription details
        await Customer.findOneAndUpdate(
          { stripeCustomerId: subscription.customer },
          { isSubscribed: true }
        );

        await Payment.findOneAndUpdate(
          { customer: subscription.metadata.customerId },
          { subscriptionId: subscription.id }
        );

        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook event:', error.message);
    return res.status(500).send('Error handling webhook event.');
  }

  res.status(200).send('Webhook handled successfully.');
};



const Customer = require('../models/customerModel');
const Payment = require('../models/paymentModel');
const App = require('../models/appModel');

exports.createCheckoutSession = async (req, res) => {
  const { appName, planId, planPrice, planName, customerName, customerEmail, portalId, isSubscribed } = req.body;

  try {
    // Check if the app and product exist
    const app = await App.findOne({ name: appName });
    if (!app) {
      return res.status(404).json({ message: `App "${appName}" not found` });
    }

    const product = await Product.findById(planId);
    if (!product) {
      return res.status(404).json({ message: `Plan "${planName}" not found` });
    }

    // Retrieve or create a customer in the database using portalId
    let customer = await Customer.findOne({ portalId });
    if (!customer) {
      customer = new Customer({
        name: customerName,
        email: customerEmail,
        portalId,
        apps: [
          {
            app: app._id,
            product: product._id,
            productType: product.productType,
            packagePrice: planPrice,
            installationDate: new Date(),
          },
        ],
        stripeCustomerId: null,
        paymentStatus: 'pending',
        isSubscribed: isSubscribed || false,
      });
      await customer.save();
    } else {
      const existingApp = customer.apps.find(
        (appEntry) =>
          appEntry.app.toString() === app._id.toString() && appEntry.product.toString() === product._id.toString()
      );

      if (existingApp) {
        existingApp.packagePrice = planPrice;
        existingApp.productType = product.productType;
      } else {
        customer.apps.push({
          app: app._id,
          product: product._id,
          productType: product.productType,
          packagePrice: planPrice,
          installationDate: new Date(),
        });
      }

      customer.paymentStatus = 'pending';
      customer.isSubscribed = isSubscribed || false;
      await customer.save();
    }

    // Create or retrieve a Stripe customer
    let stripeCustomer;
    if (customer.stripeCustomerId) {
      stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });
      customer.stripeCustomerId = stripeCustomer.id;
      await customer.save();
    }

    let sessionUrl;
    let subscriptionId = null; // Initialize the subscription ID
    let paymentMethodId = null; // Initialize the payment method ID for Pay-As-You-Go

    if (product.productType === 'pay-as-you-go') {
      // Create a Stripe Checkout session in "setup" mode to save card info
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: stripeCustomer.id,
        mode: 'setup',
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        metadata: {
          appName: app._id.toString(),
          productId: product._id.toString(),
          customerId: customer._id.toString(),
        },
      });

      sessionUrl = session.url;
    } else if (isSubscribed) {
      // Create a Stripe Price object for a subscription-based plan
      const interval = product.productType === 'monthly' ? 'month' : 'year';

      const price = await stripe.prices.create({
        unit_amount: planPrice * 100, // Convert to cents
        currency: 'usd',
        recurring: { interval },
        product_data: { name: `${planName} for ${appName}` },
      });

      // Create a subscription session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: stripeCustomer.id,
        mode: 'subscription',
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        metadata: {
          appName: app._id.toString(),
          productId: product._id.toString(),
          customerId: customer._id.toString(),
        },
      });

      sessionUrl = session.url;
      subscriptionId = session.subscription; // Save the subscription ID
    } else {
      // Create a one-time payment session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: stripeCustomer.id,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: `${planName} for ${appName}` },
              unit_amount: planPrice * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        metadata: {
          appName: app._id.toString(),
          productId: product._id.toString(),
          customerId: customer._id.toString(),
        },
      });

      sessionUrl = session.url;
    }

    // **Update the Payment Model**
    const payment = new Payment({
      customer: customer._id,
      app: app._id,
      product: product._id,
      totalPaymentAmount: planPrice,
      lastPaymentAmount: planPrice,
      paymentStatus: 'pending',
      isSubscription: isSubscribed,
      subscriptionId: subscriptionId,
      paymentMethodId: product.productType === 'pay-as-you-go' ? null : paymentMethodId,
      packageStartDate: new Date(),
      packageEndDate: product.productType === 'monthly'
        ? new Date(new Date().setMonth(new Date().getMonth() + 1))
        : product.productType === 'yearly'
        ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        : null,
      stripePaymentDetails: [
        {
          amount: planPrice,
          status: 'pending',
          stripeCustomerId: stripeCustomer.id,
          createdAt: new Date(),
        },
      ],
    });

    await payment.save();

    res.status(200).json({ url: sessionUrl });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: 'Unable to create Stripe session' });

  }
};



exports.recordUsage = async (customerId, apiCalls) => {
  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return;

    // Find the subscription item ID for metered billing
    const subscriptionItemId = customer.apps.reduce((id, appEntry) => {
      return appEntry.subscriptionItemId || id;
    }, null);

    if (!subscriptionItemId) {
      console.error('Subscription item ID not found for customer');
      return;
    }

    // Create a usage record in Stripe
    await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity: apiCalls,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    });
  } catch (error) {
    console.error('Error recording usage:', error.message);
  }
};
