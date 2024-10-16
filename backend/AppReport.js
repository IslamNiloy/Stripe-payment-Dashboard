// AppReport.js (React component)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AppReport = ({ appName }) => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    axios.get(`/api/reports/app/${appName}/report`)
      .then(response => {
        setReportData(response.data);
      })
      .catch(error => {
        console.error("Error fetching report data:", error);
      });
  }, [appName]);

  if (!reportData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Report for {reportData.appName}</h1>
      <p>Total Customers: {reportData.customerCount}</p>
      <p>Total Usage: {reportData.totalUsage} API calls</p>
      <p>Total Payments: ${reportData.totalPayments / 100}</p>

      <h2>Payment History</h2>
      <ul>
        {reportData.paymentHistory.map((payment, index) => (
          <li key={index}>
            {payment.customerName} - ${payment.amount / 100} on {new Date(payment.date).toLocaleDateString()} - Status: {payment.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppReport;
