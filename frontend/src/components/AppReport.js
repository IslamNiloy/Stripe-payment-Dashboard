import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom styled components
const StyledContainer = styled(Container)({
  padding: '20px',
  backgroundColor: '#f0f8ff',
  borderRadius: '8px',
});

const Header = styled(Typography)({
  color: '#1e88e5',
  fontWeight: 'bold',
});

const StyledCard = styled(Card)({
  backgroundColor: '#ffffff',
  boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const CardTitle = styled(Typography)({
  color: '#1e88e5',
  fontWeight: 'bold',
});

const ProductCard = styled(Card)({
  backgroundColor: '#e3f2fd',
  boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const PaymentCard = styled(Card)({
  backgroundColor: '#ffecb3',
  boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
});

const AppReport = () => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [reportData, setReportData] = useState(null);
  const [products, setProducts] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]); // Added state for payment history
  const [loading, setLoading] = useState(true);
  const [noReportData, setNoReportData] = useState(false);
  const [noProducts, setNoProducts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axios.get('/api/apps');
        setApps(response.data);
        if (response.data.length > 0) {
          setSelectedApp(response.data[0].name);
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
      setLoading(true);
      setReportData(null);
      setProducts([]);
      setPaymentHistory([]); // Clear payment history
      setNoReportData(false);
      setNoProducts(false);

      // Fetch report data
      axios.get(`/api/reports/app/${selectedApp}/report`)
        .then((response) => {
          if (!response.data || Object.keys(response.data).length === 0) {
            setNoReportData(true);
          } else {
            setReportData(response.data);
            setPaymentHistory(response.data.paymentHistory || []); // Set payment history
          }
        })
        .catch((error) => {
          console.error('Error fetching report data:', error);
          setNoReportData(true);
        });

      // Fetch products data
      axios.get(`/api/products/app/${selectedApp}/products`)
        .then((response) => {
          if (!response.data || response.data.length === 0) {
            setNoProducts(true);
          } else {
            setProducts(response.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
          setNoProducts(true);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedApp]);

  const handleAppChange = (event) => {
    setSelectedApp(event.target.value);
  };

  const handleCustomerClick = () => {
    navigate('/customer-info');
  };

  if (loading) return <div>Loading...</div>;

  if (apps.length === 0) {
    return <div>No apps available. Please create an app first.</div>;
  }

  return (
    <StyledContainer>
      <Header variant="h4" gutterBottom>
        App Reports
      </Header>

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
        <Typography variant="body1" style={{ marginTop: '20px', color: '#d32f2f' }}>
          No report data available for {selectedApp}.
        </Typography>
      ) : (
        reportData && (
          <Grid container spacing={3} style={{ marginTop: '20px' }}>
            <Grid item xs={12} sm={4}>
              <StyledCard onClick={handleCustomerClick} style={{ cursor: 'pointer' }}>
                <CardContent>
                  <CardTitle variant="h6">Total Customers</CardTitle>
                  <Typography variant="body2">{reportData.customerCount}</Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StyledCard>
                <CardContent>
                  <CardTitle variant="h6">Total Usage</CardTitle>
                  <Typography variant="body2">{reportData.totalUsage} API calls</Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StyledCard>
                <CardContent>
                  <CardTitle variant="h6">Total Payments</CardTitle>
                  <Typography variant="body2">${reportData.totalPayments}</Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )
      )}

      {/* Always show the products section */}
      <Typography variant="h6" style={{ marginTop: '20px', color: '#1e88e5' }}>
        Products for {selectedApp}
      </Typography>
      {noProducts ? (
        <Typography variant="body1" style={{ color: '#d32f2f' }}>No products available for {selectedApp}.</Typography>
      ) : (
        <Grid container spacing={2} style={{ marginTop: '20px' }}>
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <ProductCard>
                <CardContent>
                <Typography variant="h6">{product._id}</Typography>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2">Price: ${product.price}</Typography>
                  <Typography variant="body2">Limit: {product.limit} API calls</Typography>
                  <Typography variant="body2">Type: {product.productType}</Typography>
                </CardContent>
              </ProductCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Payment History Section */}
      <Typography variant="h6" style={{ marginTop: '40px', color: '#1e88e5' }}>
        Payment History
      </Typography>
      {paymentHistory.length === 0 ? (
        <Typography variant="body1" style={{ color: '#d32f2f' }}>No payment history available.</Typography>
      ) : (
        <Grid container spacing={2} style={{ marginTop: '20px' }}>
          {paymentHistory.map((payment, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <PaymentCard>
                <CardContent>
                  <Typography variant="body2">
                    {payment.customerName} - ${payment.amount} on {new Date(payment.date).toLocaleDateString()} - Status: {payment.status}
                  </Typography>
                </CardContent>
              </PaymentCard>
            </Grid>
          ))}
        </Grid>
      )}
    </StyledContainer>
  );
};

export default AppReport;
