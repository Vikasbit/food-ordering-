import React from 'react';

/**
 * PaymentMethodSelector - allows user to choose between UPI (Razorpay) and Cash on Delivery (COD).
 * Props:
 *   selectedMethod: string ('UPI' | 'COD')
 *   onChange: function(newMethod) => void
 */
export default function PaymentMethodSelector({ selectedMethod, onChange }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '20px', border: '1px solid #ECE7DF' }}>
      <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 0.8rem', fontSize: '1.1rem', fontWeight: 700 }}>
        Payment Method
      </h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="paymentMethod"
            value="UPI"
            checked={selectedMethod === 'UPI'}
            onChange={() => onChange('UPI')}
            style={{ marginRight: '0.5rem' }}
          />
          UPI (Razorpay)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={selectedMethod === 'COD'}
            onChange={() => onChange('COD')}
            style={{ marginRight: '0.5rem' }}
          />
          Cash on Delivery
        </label>
      </div>
    </div>
  );
}
