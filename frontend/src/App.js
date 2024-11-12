import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import AppReport from './components/AppReport';
import Login from './components/Login';
import CreateProductForm from './components/CreateProductForm';
import ChargeCustomerForm from './components/ChargeCustomerForm';
import CustomerInfo from './components/CustomerInfo';
import PaymentForm from './components/PaymentForm';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancelled from './components/PaymentCancelled';
import CreateAppForm from './components/CreateAppForm.js'; // New component for creating an app
import CreateUserForm from './components/CreateUserForm.js';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');
  const [userRole, setUserRole] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [apps, setApps] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      fetchUserData();
      fetchAllApps(); // Fetch all available apps for the dashboard
    } else {
      setLoading(false);
    }
  }, [authToken]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/user');
      setUserRole(response.data.user.role);
      setUserEmail(response.data.user.email);
      console.log(`User Role 1: ${response.data.user.role}`)
      console.log(`User Role 2: ${userRole}`)
      setSelectedApp(response.data.apps ? response.data.apps[0] : '');
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApps = async () => {
    try {
      const response = await axios.get('/api/apps');
      setApps(response.data); // Set the list of all apps
    } catch (error) {
      console.error('Error fetching all apps:', error);
    }
  };

  const handleLogin = (token, role) => {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuthToken(token);
    setUserRole(role);
  };

  const handleLogout = () => {
    setAuthToken('');
    setUserRole('');
    setSelectedApp('');
    setApps([]);
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <Router>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h2>Loading...</h2>
        </div>
      ) : authToken ? (
        <div style={{ display: 'flex' }}>
          <Sidebar userRole={userRole} onLogout={handleLogout} />
          <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
            <h1>Hello! {userEmail && userEmail}</h1>
            {/* <h3>{userRole && userRole ` profile!`}</h3> */}
            <Routes>
              <Route path="/" element={<AppReport apps={apps} selectedApp={selectedApp} />} />
              <Route path="/create-product" element={<CreateProductForm />} />
              <Route path="/charge-customer" element={<ChargeCustomerForm />} />
              <Route path="/customer-info" element={<CustomerInfo appName={selectedApp} />} />
              <Route path="/payment" element={<PaymentForm />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="/create-app" element={<CreateAppForm />} /> {/* Route to create a new app */}
              <Route path="/create-user" element={<CreateUserForm />} />
              {userRole === 'admin' && (
                <>
                  {/* Add routes specific to admin actions here, e.g., API key management */}
                 
                </>
              )}
            </Routes>
          </div>
        </div>
      ) : (
        <Login setAuthToken={handleLogin} />
      )}
    </Router>
  );
}

export default App;
