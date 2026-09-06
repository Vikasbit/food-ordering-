import { useEffect } from 'react';

/**
 * RazorpayButton - Triggers Razorpay Checkout using the provided order data.
 * Props:
 *   order: { amount: number, currency: string, razorpayOrderId: string, razorpayKeyId: string }
 *   onSuccess: (paymentData) => void
 *   onError: (error) => void
 */
export default function RazorpayButton({ order, onSuccess, onError }) {
  // Ensure Razorpay script is loaded – it was added to index.html.
  useEffect(() => {
    if (!window.Razorpay) {
      console.error('Razorpay script not loaded.');
    }
  }, []);

  const handleClick = () => {
    if (!window.Razorpay) {
      onError && onError(new Error('Razorpay SDK not available'));
      return;
    }

    const options = {
      key: order.razorpayKeyId,
      amount: order.amount, // in paise
      currency: order.currency,
      name: 'BIGBITES',
      description: 'Food Order',
      order_id: order.razorpayOrderId,
      handler: function (response) {
        // response: {razorpay_payment_id, razorpay_order_id, razorpay_signature}
        onSuccess && onSuccess(response);
      },
      prefill: {
        // Optional: you can prefill user details from auth context if available.
        email: '',
        contact: ''
      },
      theme: {
        color: '#C84523'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-primary"
      style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
    >
      Pay with Razorpay
    </button>
  );
}
