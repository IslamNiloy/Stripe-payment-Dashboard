// src/components/AppReport.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid } from '@mui/material';

const AppReport = ({ appName }) => {
  const [reportData, setReportData] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch report data
    axios.get(`/api/reports/app/${appName}/report`)
      .then(response => setReportData(response.data))
      .catch(error => console.error("Error fetching report data:", error));

    // Fetch products for the selected app
    axios.get(`/api/products/app/${appName}/products`)
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, [appName]);

  if (!reportData) return <div>Loading...</div>;

  return (
    <Container>
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

      {/* Display products for the selected app */}
      <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
        Products for {appName}
      </Typography>
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
    </Container>
  );
};

export default AppReport;
