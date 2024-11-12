// components/CreateAppForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography } from '@mui/material';

const CreateAppForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/apps', { name, description });
      setMessage(response.data.message);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating app:', error);
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Create New App
      </Typography>
      {message && <Typography color="secondary">{message}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="App Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Create App
        </Button>
      </form>
    </Container>
  );
};

export default CreateAppForm;
