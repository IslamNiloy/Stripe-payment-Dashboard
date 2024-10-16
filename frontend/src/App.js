import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import AppReport from './components/AppReport';
import CreateProductForm from './components/CreateProductForm';
import ChargeCustomerForm from './components/ChargeCustomerForm';
import CustomerInfo from './components/CustomerInfo';
import PaymentForm from './components/PaymentForm';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancelled from './components/PaymentCancelled';

function App() {
  const [selectedApp, setSelectedApp] = useState('');
  const [apps, setApps] = useState([]); 

 
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axios.get('/api/products/apps'); 
        setApps(response.data);  
        setSelectedApp(response.data[0] || '');  
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    };

    fetchApps();
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
          <h1>Admin Dashboard</h1>
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <label>Select App: </label>
                  <select value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}>
                    {apps.map((app) => (
                      <option key={app} value={app}>
                        {app}
                      </option>
                    ))}
                  </select>
                  {selectedApp && <AppReport appName={selectedApp} />}
                </div>
              }
            />
            <Route path="/create-product" element={<CreateProductForm />} />
            <Route path="/charge-customer" element={<ChargeCustomerForm />} />
            <Route path="/customer-info" element={<CustomerInfo appName={selectedApp} />} />
            <Route path="/payment" element={<PaymentForm />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
