import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography } from '@mui/material';

const ChargeCustomerForm = () => {
  const [stripeCustomerId, setStripeCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [appName, setAppName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/payments/charge-payg', { stripeCustomerId, productId, appName })
      .then(response => {
        alert('Customer charged successfully!');
      })
      .catch(error => {
        console.error('Error charging customer:', error);
      });
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Charge Pay-as-You-Go Customer
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Stripe Customer ID"
          value={stripeCustomerId}
          onChange={(e) => setStripeCustomerId(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="App Name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Charge Customer
        </Button>
      </form>
    </Container>
  );
};

export default ChargeCustomerForm;
