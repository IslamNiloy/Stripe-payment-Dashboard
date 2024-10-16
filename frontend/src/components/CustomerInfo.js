// src/components/CustomerInfo.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, Button } from '@mui/material';

const CustomerInfo = ({ appName }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    // Fetch customers for the selected app
    axios.get(`/api/customers/app/${appName}/customers`)
      .then(response => setCustomers(response.data))
      .catch(error => console.error('Error fetching customer data:', error));
  }, [appName]);

  const showCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Customers for {appName}
      </Typography>

      <Grid container spacing={2}>
        {customers.map((customer, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{customer.name}</Typography>
                <Typography variant="body2">Email: {customer.email}</Typography>
                <Typography variant="body2">Total Payments: ${customer.totalPayments}</Typography>
                <Button variant="contained" color="primary" onClick={() => showCustomerDetails(customer)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedCustomer && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="h6">Details for {selectedCustomer.name}</Typography>
          <p>Total Payments: ${(selectedCustomer.totalPayments / 100).toFixed(2)}</p>
          <p>API Usage: {selectedCustomer.usage}</p>
          <p>Last Charged Date: {new Date(selectedCustomer.lastChargedDate).toLocaleDateString()}</p>
          
          <Typography variant="h6" style={{ marginTop: '20px' }}>Payment History</Typography>
          <Grid container spacing={2}>
            {selectedCustomer.paymentHistory.map((payment, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="body2">
                      ${payment.amount / 100} on {new Date(payment.createdAt).toLocaleDateString()} - Status: {payment.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      )}
    </Container>
  );
};

export default CustomerInfo;
