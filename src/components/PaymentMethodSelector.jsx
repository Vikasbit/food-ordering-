import React from 'react';

/**
 * PaymentMethodSelector - allows user to choose between UPI (Razorpay) and Cash on Delivery (COD).
 * Props:
 *   selectedMethod: string ('UPI' | 'COD')
 *   onChange: function(newMethod) => void
 */
export default function PaymentMethodSelector({ selectedMethod, onChange }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '20px', border: '1px solid #ECE7DF' }}>
      <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 0.8rem', fontSize: '1.1rem', fontWeight: 700 }}>
        Payment Method
      </h3>
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '0.65rem 1rem',
            border: selectedMethod === 'UPI' ? '2px solid var(--brand-primary)' : '1px solid #ECE7DF',
            borderRadius: '12px',
            backgroundColor: selectedMethod === 'UPI' ? '#FFF7ED' : '#FFFFFF',
            minHeight: '44px',
            flex: '1 1 140px'
          }}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="UPI"
            checked={selectedMethod === 'UPI'}
            onChange={() => onChange('UPI')}
            style={{ marginRight: '0.5rem' }}
          />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>UPI (Razorpay)</span>
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '0.65rem 1rem',
            border: selectedMethod === 'COD' ? '2px solid var(--brand-primary)' : '1px solid #ECE7DF',
            borderRadius: '12px',
            backgroundColor: selectedMethod === 'COD' ? '#FFF7ED' : '#FFFFFF',
            minHeight: '44px',
            flex: '1 1 140px'
          }}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={selectedMethod === 'COD'}
            onChange={() => onChange('COD')}
            style={{ marginRight: '0.5rem' }}
          />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cash on Delivery</span>
        </label>
      </div>
    </div>
  );
}
