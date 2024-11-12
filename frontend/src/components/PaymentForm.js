import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const PaymentForm = () => {
  const [appName, setAppName] = useState('');
  const [plan, setPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [apps, setApps] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [apiKey, setApiKey] = useState(''); // API key stored in state

  // Retrieve the auth token from local storage
  const authToken = localStorage.getItem('authToken'); // Make sure this is set during login

  // Fetch the API key on component mount
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!authToken) {
        console.error("Authorization token is missing. Unable to fetch API key.");
        return;
      }
      
      try {
        const response = await axios.get('/api/api-keys', {
          headers: {
            'Authorization': `Bearer ${authToken}` // Use the auth token to get the API key
          }
        });
        setApiKey(response.data.apiKey);
        console.log("Fetched API Key:", response.data.apiKey); // Debugging log
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    fetchApiKey();
  }, [authToken]);

  // Fetch available apps for selection
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axios.get('/api/apps');
        setApps(response.data);

        if (response.data.length > 0) {
          setAppName(response.data[0].name);
        }
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    };

    fetchApps();
  }, []);

  // Fetch plans (products) based on the selected app name
  useEffect(() => {
    if (appName) {
      const fetchPlans = async () => {
        try {
          const response = await axios.get(`/api/products/app/${appName}/products`);
          setPlans(response.data);
        } catch (error) {
          console.error('Error fetching plans:', error);
        }
      };

      fetchPlans();
    } else {
      setPlans([]);
    }
  }, [appName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiKey) {
      console.error("API key is missing. Unable to proceed.");
      alert("API key is missing. Please try again later.");
      return;
    }

    const selectedPlan = plans.find((p) => p._id === plan);
    if (!selectedPlan) {
      console.error("Please select a valid plan.");
      return;
    }

    try {
      const response = await axios.post('/api/payments/create-checkout-session', {
        appName,
        planId: selectedPlan._id,
        planPrice: selectedPlan.price,
        planName: selectedPlan.name,
        customerName,
        customerEmail
      }, {
        headers: {
          'x-api-key': `${apiKey}`
        }
      });

      window.location.href = response.data.url;
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
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="app-select-label">Select App</InputLabel>
          <Select
            labelId="app-select-label"
            id="app-select"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            label="Select App"
            fullWidth
            required
          >
            <MenuItem value="" disabled>
              Choose an App
            </MenuItem>
            {apps.map((app) => (
              <MenuItem key={app._id} value={app.name}>
                {app.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" variant="outlined">
          <TextField
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
        </FormControl>

        <FormControl fullWidth margin="normal" variant="outlined">
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

        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="plan-select-label">Select a Plan</InputLabel>
          <Select
            labelId="plan-select-label"
            id="plan-select"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            label="Select a Plan"
            fullWidth
            required
          >
            <MenuItem value="" disabled>
              Choose a Plan
            </MenuItem>
            {plans.map((plan) => (
              <MenuItem key={plan._id} value={plan._id}>
                {plan.name} - ${plan.price / 100}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Proceed to Payment
        </Button>
      </form>
    </Container>
  );
};

export default PaymentForm;
