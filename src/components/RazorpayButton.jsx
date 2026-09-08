import { useEffect } from 'react';

export default function RazorpayButton({ order, onSuccess, onError }) {
  useEffect(() => {
    if (!window.Razorpay) console.error('Razorpay SDK not loaded.');
  }, []);

  const handleClick = () => {
    if (!window.Razorpay) {
      onError?.(new Error('Razorpay SDK is not loaded. Check the checkout script in index.html.'));
      return;
    }
    if (!order?.razorpayKeyId || !order?.razorpayOrderId || !order?.amount) {
      onError?.(new Error('Invalid Razorpay order returned by the backend.'));
      return;
    }

    const options = {
      key: order.razorpayKeyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'BIGBITES',
      description: 'BIGBITES Food Order',
      order_id: order.razorpayOrderId,
      handler: (response) => onSuccess?.(response),
      prefill: { email: '', contact: '' },
      theme: { color: '#C84523' },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (response) => {
      const error = response?.error || {};
      const message = [
        error.description || 'Payment failed',
        error.reason ? `Reason: ${error.reason}` : '',
        error.code ? `Code: ${error.code}` : '',
      ].filter(Boolean).join(' | ');
      onError?.(new Error(message));
    });

    rzp.on('modal.ondismiss', () => {
      // Dismissing the checkout is not a payment failure; the order remains pending.
      console.info('Razorpay checkout dismissed by customer.');
    });

    rzp.open();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-primary"
      style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
    >
      Pay via UPI
    </button>
  );
}
