import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, Button, FormControl, InputLabel, Select, MenuItem, Paper, TextField } from '@mui/material';

const CustomerInfo = () => {
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedAppName, setSelectedAppName] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [noCustomers, setNoCustomers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all apps
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axios.get('/api/apps');
        setApps(response.data);
        if (response.data.length > 0) {
          setSelectedAppId(response.data[0]._id);
          setSelectedAppName(response.data[0].name);
        }
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    };
    fetchApps();
  }, []);

  // Fetch customers for the selected app
  useEffect(() => {
    if (selectedAppId) {
      setCustomers([]);
      setSelectedCustomer(null);
      setNoCustomers(false);

      axios.get(`/api/customers/app/${selectedAppId}/customers`)
        .then(response => {
          if (response.data.length === 0) {
            setNoCustomers(true);
          } else {
            setCustomers(response.data); // Directly set the customers returned from the API
          }
        })
        .catch(error => {
          console.error('Error fetching customer data:', error);
          setNoCustomers(true);
        });
    }
  }, [selectedAppId]);

  const handleAppChange = (event) => {
    const appId = event.target.value;
    const appName = apps.find(app => app._id === appId)?.name;
    setSelectedAppId(appId);
    setSelectedAppName(appName);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filter customers by name or portal ID using the search query
  const filteredCustomers = customers.filter(customer => {
    const name = customer.name ? customer.name.toLowerCase() : '';
    const portalId = customer.portalId ? customer.portalId.toString() : ''; // Ensure portalId is a string
    return name.includes(searchQuery) || portalId.includes(searchQuery);
  });

  const showCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <Container style={{ padding: '20px', backgroundColor: '#f0f4f8', borderRadius: '10px' }}>
      <Typography variant="h4" gutterBottom style={{ color: '#1e88e5', fontWeight: 'bold', textAlign: 'center' }}>
        Customer Information
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="app-select-label">Select App</InputLabel>
        <Select
          labelId="app-select-label"
          id="app-select"
          value={selectedAppId}
          onChange={handleAppChange}
          label="Select App"
          style={{ backgroundColor: '#ffffff', borderRadius: '5px' }}
        >
          {apps.map((app) => (
            <MenuItem key={app._id} value={app._id}>
              {app.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        placeholder="Search by name or portal ID"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ backgroundColor: '#ffffff', borderRadius: '5px' }}
      />

      {noCustomers ? (
        <Typography variant="body1" style={{ marginTop: '20px', color: '#e53935', textAlign: 'center' }}>
          No customers found for {selectedAppName}.
        </Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom style={{ marginTop: '20px', color: '#1e88e5' }}>
            Customers for {selectedAppName}
          </Typography>
          <Grid container spacing={3}>
            {filteredCustomers.map((customer, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card style={{ backgroundColor: '#bbdefb', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" style={{ color: '#0d47a1', fontWeight: 'bold' }}>{customer.name}</Typography>
                    <Typography variant="body2">Email: {customer.email}</Typography>
                    <Typography variant="body2">Portal ID: {customer.portalId}</Typography>
                    <Typography variant="body2">Payment Status: {customer.paymentStatus}</Typography>
                    <Typography variant="body2">Subscription: {customer.isSubscribed ? 'Yes' : 'No'}</Typography>
                    {customer.apps.map((app, index) => (
                      <div key={index} style={{ marginTop: '10px' }}>
                        <Typography variant="body2">Product: {app.productName}</Typography>
                        <Typography variant="body2">Package Price: ${app.packagePrice}</Typography>
                        <Typography variant="body2">Limit: {app.limit} API calls</Typography>
                        <Typography variant="body2">Available Limit: {app.availableLimit} API calls</Typography>
                      </div>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => showCustomerDetails(customer)}
                      style={{ marginTop: '10px', backgroundColor: '#1e88e5' }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                  {selectedCustomer && selectedCustomer.id === customer.id && (
                    <Paper style={{ marginTop: '10px', padding: '15px', backgroundColor: '#ffffff', borderRadius: '10px' }}>
                      <Typography variant="h5" style={{ color: '#1e88e5', fontWeight: 'bold' }}>
                        Details for {selectedCustomer.name}
                      </Typography>
                      <Typography variant="body1">Payment Status: {selectedCustomer.paymentStatus}</Typography>
                      <Typography variant="body1">API Usage: {selectedCustomer.totalApiCalls} calls</Typography>
                      <Typography variant="body1">
                        Last Charged Date: {selectedCustomer.lastChargedDate ? new Date(selectedCustomer.lastChargedDate).toLocaleDateString() : 'N/A'}
                      </Typography>

                      <Typography variant="h6" style={{ marginTop: '10px', color: '#1e88e5', fontWeight: 'bold' }}>Payment History</Typography>
                      <Grid container spacing={2}>
                        {selectedCustomer.paymentHistory.map((payment, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Card style={{ backgroundColor: '#ffccbc', borderRadius: '10px' }}>
                              <CardContent>
                                <Typography variant="body2" style={{ fontWeight: 'bold' }}>Amount: ${payment.totalPaymentAmount}</Typography>
                                <Typography variant="body2">
                                  Date: {payment.packageStartDate ? new Date(payment.packageStartDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                                <Typography variant="body2">Status: {payment.stripePaymentDetails?.[0]?.status || 'N/A'}</Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default CustomerInfo;
