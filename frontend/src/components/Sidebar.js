// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText } from '@mui/material';

const Sidebar = ({ userRole, onLogout }) => {
  return (
    <div style={{ width: '250px', height: '100vh', backgroundColor: '#f4f4f4', padding: '20px' }}>
      <h3>Menu</h3>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/create-user">
          <ListItemText primary="Create User" />
        </ListItem>
        <ListItem button component={Link} to="/create-product">
          <ListItemText primary="Create Product" />
        </ListItem>
        <ListItem button component={Link} to="/charge-customer">
          <ListItemText primary="Charge Customer" />
        </ListItem>
        <ListItem button component={Link} to="/customer-info">
          <ListItemText primary="Customer Info" />
        </ListItem>
        <ListItem button component={Link} to="/payment">
          <ListItemText primary="Payment Form" />
        </ListItem>
        <ListItem button component={Link} to="/create-app">
          <ListItemText primary="Create App" />
        </ListItem>
        <ListItem button onClick={onLogout}>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;
