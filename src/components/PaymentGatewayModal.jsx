import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findNearestServingKitchen } from '../services/deliveryZoneService';
import { formatINR, parsePrice } from '../utils/currency';

export default function PaymentGatewayModal({ isOpen, onClose, cartItems = [], deliveryLocation, onPaymentSuccess }) {
  const [activeTab, setActiveTab] = useState('upi_qr');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if (!isOpen) return null;

  const nearestMatch = findNearestServingKitchen(deliveryLocation?.lat, deliveryLocation?.lng);

  const subtotal = cartItems.reduce((acc, item) => {
    const numericPrice = parsePrice(item.price);
    return acc + numericPrice * (item.quantity || 1);
  }, 0);

  const gstAmount = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 39;
  const grandTotal = subtotal + gstAmount + deliveryFee;

  const handlePayNow = () => {
    if (!nearestMatch.isDeliverable) {
      alert(`Delivery address is outside our kitchen service zones (${nearestMatch.distanceKm} km away). Please select a deliverable location.`);
      return;
    }
    if (activeTab === 'upi_id' && !upiIdInput.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    if (activeTab === 'card' && (!cardDetails.number || cardDetails.number.length < 12)) {
      alert('Please enter a valid card number');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentDone(true);
      setTimeout(() => {
        onPaymentSuccess({
          orderId: `EN-${Math.floor(100000 + Math.random() * 900000)}`,
          subtotal,
          gstAmount,
          deliveryFee,
          grandTotal,
          paymentMethod: activeTab.toUpperCase(),
          items: cartItems,
          location: deliveryLocation,
          kitchen: nearestMatch.selectedKitchen,
          estimatedDeliveryMin: nearestMatch.totalEtaMin,
          date: new Date().toLocaleString()
        });
        setPaymentDone(false);
      }, 1500);
    }, 2200);
  };

  const tabBtnStyle = (tabId) => ({
    padding: '0.75rem 0.5rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.82rem',
    fontWeight: 700,
    borderRadius: '12px',
    border: activeTab === tabId ? '1.5px solid var(--brand-primary)' : '1px solid #E5E0D8',
    backgroundColor: activeTab === tabId ? '#FFF7ED' : '#FFFFFF',
    color: activeTab === tabId ? 'var(--brand-primary)' : 'var(--brand-dark)',
    cursor: 'pointer',
    boxShadow: activeTab === tabId ? '0 4px 12px rgba(200,69,35,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.35rem',
    flex: 1,
    textAlign: 'center',
    transition: 'all 0.2s ease'
  });

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    fontWeight: 600,
    borderRadius: '10px',
    border: '1.5px solid #E5E0D8',
    backgroundColor: '#FAFAF9',
    outline: 'none',
    boxSizing: 'border-box',
    color: 'var(--brand-dark)'
  };

  return (
    <AnimatePresence>
      <div
        key="payment-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '1rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '92vh',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #ECE7DF',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#0F766E',
              backgroundImage: 'linear-gradient(135deg, #0F766E, #0D9488)',
              padding: '1.25rem 1.75rem',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}
              >
                🔒
              </div>
              <div>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
                  Secure Payment Gateway
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#CCFBF1', fontWeight: 500 }}>
                  256-Bit Encrypted · Verified Merchant Checkout
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              ✕
            </button>
          </div>

          {/* Processing State */}
          {processing ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '60px', height: '60px', border: '4px solid var(--red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>PROCESSING PAYMENT...</h3>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#666' }}>Contacting bank & verifying transaction token...</p>
              <div style={{ backgroundColor: 'var(--yellow)', border: '2px solid var(--black)', padding: '0.6rem 1rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
                ⚠️ PLEASE DO NOT REFRESH OR CLOSE THIS WINDOW
              </div>
            </div>
          ) : paymentDone ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '4rem' }}>✅</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--green, #16a34a)', margin: 0 }}>PAYMENT SUCCESSFUL! 🎉</h3>
              <p style={{ fontWeight: 800, fontSize: '1rem' }}>₹{grandTotal} RECEIVED. CREATING ORDER & ASSIGNING RIDER.</p>
            </div>
          ) : (
            /* Main Checkout Content */
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Delivery & Kitchen Match */}
              <div style={{ backgroundColor: '#FAF5EE', borderRadius: '16px', border: '1px solid #ECE7DF', padding: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  <span>Delivery & Matched Kitchen</span>
                  <span style={{ color: '#16A34A' }}>✅ Zone Verified</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E5E0D8' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-primary)', display: 'block' }}>DELIVERING TO:</span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deliveryLocation?.address || 'Connaught Place, New Delhi'}</span>
                    <span style={{ fontSize: '0.72rem', color: '#78716C' }}>Label: {deliveryLocation?.label || 'HOME'}</span>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E5E0D8' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16A34A', display: 'block' }}>PREPARED BY:</span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nearestMatch.selectedKitchen.name}</span>
                    <span style={{ fontSize: '0.72rem', color: '#78716C' }}>ETA: ~{nearestMatch.totalEtaMin} min ({nearestMatch.distanceKm} km)</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DF', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  <span>Order Summary ({cartItems.length} items)</span>
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>GST Invoice</span>
                </div>
                <div style={{ borderBottom: '1px dashed #E5E0D8', paddingBottom: '0.6rem', marginBottom: '0.6rem', maxHeight: '120px', overflowY: 'auto' }}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      <span style={{ color: '#44403C' }}>{item.quantity}x {item.name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>{formatINR(parsePrice(item.price))}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716C' }}><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716C' }}><span>GST Tax (5%)</span><span>{formatINR(gstAmount)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716C' }}><span>Delivery Fee</span><span>{deliveryFee === 0 ? 'FREE 🚚' : formatINR(deliveryFee)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid #EFEAE2', paddingTop: '0.6rem', marginTop: '0.3rem', color: 'var(--brand-dark)' }}>
                    <span>Grand Total</span>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 800, fontSize: '1.25rem' }}>{formatINR(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECE7DF', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                  SELECT PAYMENT METHOD
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button onClick={() => setActiveTab('upi_qr')} style={tabBtnStyle('upi_qr')}>
                    <span style={{ fontSize: '1.2rem' }}>📱</span><span>UPI SCAN</span>
                  </button>
                  <button onClick={() => setActiveTab('upi_id')} style={tabBtnStyle('upi_id')}>
                    <span style={{ fontSize: '1.2rem' }}>📲</span><span>UPI ID</span>
                  </button>
                  <button onClick={() => setActiveTab('card')} style={tabBtnStyle('card')}>
                    <span style={{ fontSize: '1.2rem' }}>💳</span><span>CARD</span>
                  </button>
                  <button onClick={() => setActiveTab('cod')} style={tabBtnStyle('cod')}>
                    <span style={{ fontSize: '1.2rem' }}>💵</span><span>COD</span>
                  </button>
                </div>

                {/* UPI QR Tab */}
                {activeTab === 'upi_qr' && (
                  <div style={{ backgroundColor: '#FAF5EE', borderRadius: '12px', border: '1px solid #ECE7DF', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ borderRadius: '12px', padding: '0.5rem', backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=bigbites@upi&pn=BigBitesKitchen&am=${grandTotal}&cu=INR`}
                        alt="UPI QR Code"
                        style={{ width: '140px', height: '140px', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--brand-dark)' }}>
                      SCAN WITH ANY UPI APP (GPAY, PHONEPE, PAYTM, CRED)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78716C' }}>
                      Amount: <strong style={{ color: 'var(--brand-primary)' }}>₹{grandTotal}</strong> • Merchant: BigBites Kitchen
                    </div>
                  </div>
                )}

                {/* UPI ID Tab */}
                {activeTab === 'upi_id' && (
                  <div style={{ backgroundColor: '#FAF5EE', borderRadius: '12px', border: '1px solid #ECE7DF', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#57534E' }}>ENTER YOUR UPI VPA ID</label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="yourname@upi / 9876543210@paytm"
                      style={inputStyle}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#78716C', margin: 0 }}>We'll send a payment request to your UPI app.</p>
                  </div>
                )}

                {/* Card Tab */}
                {activeTab === 'card' && (
                  <div style={{ backgroundColor: '#FAF5EE', borderRadius: '12px', border: '1px solid #ECE7DF', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#57534E' }}>CARD NUMBER</label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                      placeholder="1234 5678 9012 3456"
                      style={inputStyle}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#57534E' }}>EXPIRY</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#57534E' }}>CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.slice(0, 4) })}
                          placeholder="•••"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#57534E' }}>NAME</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          placeholder="Name on card"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* COD Tab */}
                {activeTab === 'cod' && (
                  <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      💵 CASH ON DELIVERY (COD) SELECTED
                    </div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 500, color: '#78350F', margin: 0 }}>
                      Pay <strong style={{ color: 'var(--brand-primary)' }}>₹{grandTotal}</strong> in cash or scan driver QR code upon arrival at your doorstep.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Pay Button */}
          {!processing && !paymentDone && (
            <div
              style={{
                backgroundColor: '#FAFAF9',
                borderTop: '1px solid #EFEAE2',
                padding: '1.1rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <button
                onClick={onClose}
                style={{
                  width: '35%',
                  padding: '0.85rem',
                  backgroundColor: '#FFFFFF',
                  color: '#57534E',
                  border: '1px solid #D6D3D1',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePayNow}
                style={{
                  width: '65%',
                  padding: '0.85rem',
                  backgroundColor: '#16A34A',
                  backgroundImage: 'linear-gradient(135deg, #16A34A, #15803D)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Pay {formatINR(grandTotal)} Now</span>
                <span>→</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
}
