import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const CreateProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/products', { name, price, appName });
      alert('Product created successfully!');
      setName('');
      setPrice('');
      setAppName('');
    } catch (error) {
      console.error('Error creating product:', error);
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
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="app-name-label">App Name</InputLabel>
          <Select
            labelId="app-name-label"
            id="app-name-select"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            label="App Name" // Add label here to associate with InputLabel
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
