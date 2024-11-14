import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const CreateProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [limit, setLimit] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [productType, setProductType] = useState('');
  const [appName, setAppName] = useState('');
  const [apps, setApps] = useState([]); // List of apps

  useEffect(() => {
    // Fetch the list of apps for the dropdown
    const fetchApps = async () => {
      try {
        const response = await axios.get('/api/apps');
        setApps(response.data); // Set the list of apps
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    };

    fetchApps();
  }, []);

  // Update expireDate and limit based on productType
  useEffect(() => {
    if (productType === 'monthly') {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setExpireDate(date.toISOString().split('T')[0]);
    } else if (productType === 'yearly') {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      setExpireDate(date.toISOString().split('T')[0]);
    } else if (productType === 'pay-as-you-go') {
      setExpireDate('');
      setLimit(''); // Clear the limit for pay-as-you-go
    }
  }, [productType]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/products/create-product', {
        name,
        price,
        limit: productType === 'pay-as-you-go' ? null : limit,
        expireDate,
        productType,
        appName
      });
      alert('Product created successfully!');
      setName('');
      setPrice('');
      setLimit('');
      setExpireDate('');
      setProductType('');
      setAppName('');
    } catch (error) {
      console.error('Error creating product:', error);
      alert(error.response?.data?.message || 'Error creating product');
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Create New Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Limit"
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          fullWidth
          margin="normal"
          disabled={productType === 'pay-as-you-go'} // Disable limit input for pay-as-you-go
        />
        <TextField
          label="Expire Date"
          type="date"
          value={expireDate}
          onChange={(e) => setExpireDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          disabled // Expire date is auto-set based on product type
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="product-type-label">Product Type</InputLabel>
          <Select
            labelId="product-type-label"
            id="product-type-select"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            label="Product Type"
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
            <MenuItem value="pay-as-you-go">Pay As You Go</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="app-name-label">App Name</InputLabel>
          <Select
            labelId="app-name-label"
            id="app-name-select"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            label="App Name"
          >
            {apps.map((app) => (
              <MenuItem key={app._id} value={app.name}>
                {app.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Create Product
        </Button>
      </form>
    </Container>
  );
};

export default CreateProductForm;
