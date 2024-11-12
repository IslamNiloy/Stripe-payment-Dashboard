import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography } from '@mui/material';

const CreateUserForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

//   useEffect(() => {
//     // Fetch the list of apps for the dropdown
//     const fetchApps = async () => {
//       try {
//         const response = await axios.get('/api/apps');
//         setApps(response.data); // Set the list of apps
//       } catch (error) {
//         console.error('Error fetching apps:', error);
//       }
//     };

//     fetchApps();
//   }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/customers/admin/create-user', { email, password });
      alert('User created successfully!');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Create New User
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email Address"
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

    <TextField
          label="Password"
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />


        <Button type="submit" variant="contained" color="primary" fullWidth>
          Create User
        </Button>
      </form>
    </Container>
  );
};

export default CreateUserForm;
