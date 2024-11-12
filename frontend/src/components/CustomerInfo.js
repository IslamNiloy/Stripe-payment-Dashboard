import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const CustomerInfo = () => {
  const [apps, setApps] = useState([]); // List of all apps
  const [selectedApp, setSelectedApp] = useState(''); // Selected app name
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [noCustomers, setNoCustomers] = useState(false); // To handle no customers found

  useEffect(() => {
    // Fetch all apps for the dropdown
    const fetchApps = async () => {
      try {
        const response = await axios.get('/api/apps');
        setApps(response.data);
        if (response.data.length > 0) {
          setSelectedApp(response.data[0].name); // Automatically select the first app
        }
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    };

    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      setCustomers([]); // Clear previous customers
      setSelectedCustomer(null); // Reset selected customer
      setNoCustomers(false); // Reset noCustomers state

      // Fetch customers for the selected app
      axios.get(`/api/customers/app/${selectedApp}/customers`)
        .then(response => {
          if (response.data.length === 0) {
            setNoCustomers(true);
          } else {
            setCustomers(response.data);
          }
        })
        .catch(error => {
          console.error('Error fetching customer data:', error);
          setNoCustomers(true);
        });
    }
  }, [selectedApp]);

  const handleAppChange = (event) => {
    setSelectedApp(event.target.value); // Update selected app
  };

  const showCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Customer Information
      </Typography>

      {/* Dropdown to select an app */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="app-select-label">Select App</InputLabel>
        <Select
          labelId="app-select-label"
          id="app-select"
          value={selectedApp}
          onChange={handleAppChange}
          label="Select App"
        >
          {apps.map((app) => (
            <MenuItem key={app._id} value={app.name}>
              {app.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {noCustomers ? (
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          No customers found for {selectedApp}.
        </Typography>
      ) : (
        <>
          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
            Customers for {selectedApp}
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
        </>
      )}

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
