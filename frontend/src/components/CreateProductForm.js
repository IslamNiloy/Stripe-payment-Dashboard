// src/components/CreateProductForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography } from '@mui/material';

const CreateProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [appName, setAppName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/products', { name, price, appName })
      .then(response => {
        alert('Product created successfully!');
      })
      .catch(error => {
        console.error('Error creating product:', error);
      });
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
        />
        <TextField
          label="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
          Create Product
        </Button>
      </form>
    </Container>
  );
};

export default CreateProductForm;
