import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const AppReport = () => {
  const [apps, setApps] = useState([]); // List of all apps
  const [selectedApp, setSelectedApp] = useState(''); // Selected app name
  const [reportData, setReportData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noReportData, setNoReportData] = useState(false); // Handle no report data case
  const [noProducts, setNoProducts] = useState(false); // Handle no products case

  useEffect(() => {
    // Fetch all apps and set the default selected app
    const fetchApps = async () => {
      try {
        const response = await axios.get('/api/apps');
        setApps(response.data);
        console.log("Fetched apps:", response.data);

        if (response.data.length > 0) {
          setSelectedApp(response.data[0].name); // Automatically select the first app
        }
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
      setLoading(false);
    };

    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      setLoading(true); // Set loading true when fetching data
      setReportData(null); // Clear previous report data
      setProducts([]); // Clear previous products
      setNoReportData(false); // Reset noReportData state
      setNoProducts(false); // Reset noProducts state

      // Fetch report data for the selected app
      axios.get(`/api/reports/app/${selectedApp}/report`)
        .then(response => {
          if (!response.data || Object.keys(response.data).length === 0) {
            setNoReportData(true); // No report data found
          } else {
            setReportData(response.data);
          }
          console.log("Fetched report data:", response.data);
        })
        .catch(error => {
          console.error("Error fetching report data:", error);
          setNoReportData(true); // Handle error as no data
        });

      // Fetch products for the selected app
      axios.get(`/api/products/app/${selectedApp}/products`)
        .then(response => {
          if (!response.data || response.data.length === 0) {
            setNoProducts(true); // No products found
          } else {
            setProducts(response.data);
          }
          console.log("Fetched products:", response.data);
        })
        .catch(error => {
          console.error("Error fetching products:", error);
          setNoProducts(true); // Handle error as no products
        })
        .finally(() => setLoading(false)); // Stop loading after fetch
    }
  }, [selectedApp]);

  const handleAppChange = (event) => {
    setSelectedApp(event.target.value); // Update selected app
  };

  if (loading) return <div>Loading...</div>;

  if (apps.length === 0) {
    return <div>No apps available. Please create an app first.</div>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        App Reports
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

      {noReportData ? (
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          No report data available for {selectedApp}.
        </Typography>
      ) : (
        reportData && (
          <>
            <Typography variant="h4" gutterBottom>
              Report for {reportData.appName}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Customers</Typography>
                    <Typography variant="body2">{reportData.customerCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Usage</Typography>
                    <Typography variant="body2">{reportData.totalUsage} API calls</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Payments</Typography>
                    <Typography variant="body2">${reportData.totalPayments}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
              Payment History
            </Typography>
            <Grid container spacing={2}>
              {reportData.paymentHistory.map((payment, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2">
                        {payment.customerName} - ${payment.amount} on {new Date(payment.date).toLocaleDateString()} - Status: {payment.status}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )
      )}

      <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
        Products for {selectedApp}
      </Typography>
      {noProducts ? (
        <Typography variant="body1">No products available for {selectedApp}.</Typography>
      ) : (
        <Grid container spacing={2}>
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2">Price: ${product.price}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AppReport;
