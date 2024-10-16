import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    // Here you can make an API call to fetch payment details using the session ID if needed
    console.log('Payment session ID:', sessionId);
  }, [searchParams]);

  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Thank you for your purchase. You will be redirected to your dashboard shortly.</p>
    </div>
  );
};

export default PaymentSuccess;
