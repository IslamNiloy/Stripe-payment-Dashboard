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
      // Verify and construct the event using the raw body
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log('Webhook received and verified:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }
  
    // Process the event (example: checkout.session.completed)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('checkout.session.completed event received for session:', session);
  
      try {
        // Check if the customer already exists in your StripePayment collection
        let customer = await StripePayment.findOne({ stripeCustomerId: session.customer });
  
        if (!customer) {
          console.log('Customer not found. Creating a new customer...');
  
          // If the customer does not exist, create a new one
          customer = new StripePayment({
            stripeCustomerId: session.customer,
            appName: session.metadata.appName,
            customerDetails: {
              name: session.customer_details.name,
              email: session.customer_details.email,
              phone: session.customer_details.phone,
              country: session.customer_details.address.country
            },
            productId: session.metadata.productId,
            payments: [], 
            usage: { apiCalls: 0, lastChargedDate: new Date() }
          });
        }
  
        // Add the payment information to the payments array
        const paymentInfo = {
          productId: customer.productId,
          amount: session.amount_total,
          status: session.payment_status,
          createdAt: new Date(session.created * 1000),
          customerDetails: customer.customerDetails
        };
  
        customer.payments.push(paymentInfo);
        customer.usage.lastChargedDate = new Date();  
  
        // Save the updated or new customer record
        await customer.save();
  
        // Unlock API calls for this customer
        // console.log('Unlocking API calls for customer:', customer.stripeCustomerId);
        // Add your logic to unlock API calls here
  
        // console.log('Payment information saved to database:', paymentInfo);
      } catch (err) {
        console.error('Error saving payment to database:', err.message);
        return res.status(500).send('Error saving payment to database.');
      }
    }
  
    res.status(200).send('Webhook received successfully.');
  };
  


// In your createCheckoutSession method
exports.createCheckoutSession = async (req, res) => {
    const { appName, planId, planPrice, planName, customerName, customerEmail } = req.body;
  
    try {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName, // Adjust this as necessary
      });
  
      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${planName} for ${appName}`,
              },
              unit_amount: planPrice * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer: customer.id, // Attach the created customer to the session
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        metadata: {
          appName: appName,
          productId: planId
        }
      });
  
      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error.message);
      res.status(500).json({ error: 'Unable to create Stripe session' });
    }
  };
  