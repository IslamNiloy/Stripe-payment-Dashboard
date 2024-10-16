import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, MenuItem, Select, FormControl } from '@mui/material';

const PaymentForm = () => {
  const [appName, setAppName] = useState('');
  const [plan, setPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Fetch plans (products) from the database based on appName
  useEffect(() => {
    if (appName) {
      const fetchPlans = async () => {
        try {
          const response = await axios.get(`/api/products/app/${appName}/products`); // Fetch products based on appName
          setPlans(response.data); // Set the plans in the state
        } catch (error) {
          console.error('Error fetching plans:', error);
        }
      };

      fetchPlans();
    }
  }, [appName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/payments/create-checkout-session', {
        appName,
        planId: plan._id,  // Assuming each plan has a unique _id
        planPrice: plan.price,
        planName: plan.name,
        customerName,
        customerEmail
      });

      window.location.href = response.data.url; // Redirect to Stripe payment page
    } catch (error) {
      console.error('Error creating payment session:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Select Your Plan and App
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          {/* Use TextField with a label instead of separate InputLabel */}
          <TextField
            label="App Name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          {/* Customer Name TextField */}
          <TextField
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          {/* Customer Email TextField */}
          <TextField
            label="Customer Email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
        </FormControl>

        {plans.length > 0 && (
          <FormControl fullWidth margin="normal">
            {/* Plan Selection */}
            <Select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              fullWidth
              required
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="" disabled>
                Select a Plan
              </MenuItem>
              {plans.map((plan) => (
                <MenuItem key={plan._id} value={plan}>
                  {plan.name} - ${plan.price } {/* Assuming price is in cents */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Proceed to Payment
        </Button>
      </form>
    </Container>
  );
};

export default PaymentForm;
