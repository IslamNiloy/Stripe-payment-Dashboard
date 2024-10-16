const cron = require('node-cron');
const StripePayment = require('./models/stripeModel');
const { chargePayAsYouGoCustomer } = require('./controllers/paymentController');

// Function to trigger charge for customers after 30 days
const runCronJob = async () => {
    const today = new Date();

    try {
        // Find all customers
        const customers = await StripePayment.find();

        // Loop through each customer and check if 30 days have passed since last charge
        for (const customer of customers) {
            const lastChargedDate = new Date(customer.usage.lastChargedDate);
            const timeDiff = today.getTime() - lastChargedDate.getTime();
            const daysSinceLastCharge = timeDiff / (1000 * 3600 * 24); // Convert milliseconds to days

            // Only charge if 30 days have passed since the last charge
            if (daysSinceLastCharge >= 30) {
                // Prepare the request body with necessary data
                const req = {
                    body: {
                        stripeCustomerId: customer.stripeCustomerId,
                        productId: customer.productId,
                        appName: customer.appName
                    }
                };

                const res = {
                    status: (code) => ({
                        json: (data) => console.log(`Status: ${code}, Response:`, data)
                    }),
                    json: (data) => console.log('Response:', data)
                };

                // Call the existing chargePayAsYouGoCustomer function to process the charge
                await chargePayAsYouGoCustomer(req, res);
            }
        }
    } catch (error) {
        console.error('Error running Pay-as-You-Go cron job:', error);
    }
};

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running Pay-as-You-Go customer charging job...');
    runCronJob();
});

module.exports = { runCronJob };
