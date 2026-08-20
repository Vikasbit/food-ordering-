import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findNearestServingKitchen } from '../services/deliveryZoneService';

export default function PaymentGatewayModal({ isOpen, onClose, cartItems = [], deliveryLocation, onPaymentSuccess }) {
  const [activeTab, setActiveTab] = useState('upi_qr');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if (!isOpen) return null;

  const nearestMatch = findNearestServingKitchen(deliveryLocation?.lat, deliveryLocation?.lng);

  const subtotal = cartItems.reduce((acc, item) => {
    const numericPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
    return acc + numericPrice * (item.quantity || 1);
  }, 0);

  const gstAmount = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal >= 300 || subtotal === 0 ? 0 : 40;
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
    padding: '0.7rem 1rem',
    fontFamily: 'var(--font-display)',
    fontSize: '0.8rem',
    border: 'var(--border-thick)',
    backgroundColor: activeTab === tabId ? 'var(--yellow)' : 'var(--white)',
    color: 'var(--black)',
    cursor: 'pointer',
    boxShadow: activeTab === tabId ? '3px 3px 0px var(--black)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
    flex: 1,
    textAlign: 'center'
  });

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 1rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    fontWeight: 700,
    border: 'var(--border-thick)',
    backgroundColor: 'var(--cream)',
    outline: 'none',
    boxSizing: 'border-box'
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
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
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
            backgroundColor: 'var(--cream)',
            border: '4px solid var(--black)',
            boxShadow: '10px 10px 0px var(--black)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: 'var(--green, #16a34a)',
              borderBottom: '4px solid var(--black)',
              padding: '1.2rem 1.5rem',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--black)',
                  border: '2px solid var(--black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  boxShadow: '2px 2px 0px var(--black)'
                }}
              >
                🔒
              </div>
              <div>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                  CHECKOUT & PAYMENT
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)' }}>
                  100% SECURE ENCRYPTED TRANSACTION
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--white)',
                color: 'var(--black)',
                border: '2px solid var(--black)',
                fontWeight: 900,
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px var(--black)'
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* Delivery & Kitchen Match */}
              <div style={{ backgroundColor: 'var(--white)', border: 'var(--border-thick)', padding: '1rem', boxShadow: '3px 3px 0px var(--black)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-display)', color: '#888', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  <span>DELIVERY DESTINATION & MATCHED KITCHEN</span>
                  <span style={{ color: 'var(--green, #16a34a)' }}>✅ ZONE VERIFIED</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <div style={{ backgroundColor: 'var(--cream)', padding: '0.7rem', border: '2px solid var(--black)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--red)', display: 'block' }}>DELIVERING TO:</span>
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deliveryLocation?.address || 'Connaught Place, New Delhi'}</span>
                    <span style={{ fontSize: '0.65rem', color: '#888' }}>Label: {deliveryLocation?.label || 'HOME'}</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--cream)', padding: '0.7rem', border: '2px solid var(--black)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--green, #16a34a)', display: 'block' }}>PREPARED BY:</span>
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nearestMatch.selectedKitchen.name}</span>
                    <span style={{ fontSize: '0.65rem', color: '#888' }}>ETA: ~{nearestMatch.totalEtaMin} min ({nearestMatch.distanceKm} km)</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div style={{ backgroundColor: 'var(--white)', border: 'var(--border-thick)', padding: '1rem', boxShadow: '3px 3px 0px var(--black)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-display)', color: '#888', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  <span>ORDER SUMMARY ({cartItems.length} ITEMS)</span>
                  <span style={{ color: 'var(--red)', fontWeight: 800 }}>GST INVOICE READY</span>
                </div>
                <div style={{ borderBottom: '2px dashed #ccc', paddingBottom: '0.6rem', marginBottom: '0.6rem', maxHeight: '120px', overflowY: 'auto' }}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span>{String(item.price).includes('₹') ? item.price : `₹${String(item.price).replace(/[^0-9]/g, '')}`}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}><span>GST Tax (5%)</span><span>₹{gstAmount}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}><span>Delivery Fee</span><span>{deliveryFee === 0 ? 'FREE 🚚' : `₹${deliveryFee}`}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: '1.1rem', borderTop: '2px solid var(--black)', paddingTop: '0.4rem', marginTop: '0.3rem' }}>
                    <span>GRAND TOTAL</span>
                    <span style={{ color: 'var(--red)', fontWeight: 900, fontSize: '1.2rem' }}>₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div style={{ backgroundColor: 'var(--white)', border: 'var(--border-thick)', padding: '1rem', boxShadow: '3px 3px 0px var(--black)' }}>
                <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', color: '#888', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
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
                  <div style={{ backgroundColor: 'var(--white)', border: 'var(--border-thick)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ border: '4px solid var(--black)', padding: '0.5rem', backgroundColor: 'var(--white)', boxShadow: '3px 3px 0px var(--black)' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=eatnaked@upi&pn=EATnakedKitchen&am=${grandTotal}&cu=INR`}
                        alt="UPI QR Code"
                        style={{ width: '140px', height: '140px', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem' }}>
                      SCAN WITH ANY UPI APP (GPAY, PHONEPE, PAYTM, CRED)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>
                      Amount: <strong style={{ color: 'var(--red)' }}>₹{grandTotal}</strong> • Merchant: EATnaked Kitchen
                    </div>
                  </div>
                )}

                {/* UPI ID Tab */}
                {activeTab === 'upi_id' && (
                  <div style={{ backgroundColor: 'var(--white)', border: 'var(--border-thick)', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem' }}>ENTER YOUR UPI VPA ID</label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="yourname@upi / 9876543210@paytm"
                      style={inputStyle}
                    />
                    <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>We'll send a payment request to your UPI app.</p>
                  </div>
                )}

                {/* Card Tab */}
                {activeTab === 'card' && (
                  <div style={{ backgroundColor: 'var(--white)', border: 'var(--border-thick)', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem' }}>CARD NUMBER</label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                      placeholder="1234 5678 9012 3456"
                      style={inputStyle}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem' }}>EXPIRY</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem' }}>CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.slice(0, 4) })}
                          placeholder="•••"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem' }}>NAME</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          placeholder="Name"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* COD Tab */}
                {activeTab === 'cod' && (
                  <div style={{ backgroundColor: '#FFFBEB', border: 'var(--border-thick)', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ⚠️ CASH ON DELIVERY (COD) SELECTED
                    </div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', margin: 0 }}>
                      Pay <strong style={{ color: 'var(--red)' }}>₹{grandTotal}</strong> in cash or scan driver QR code upon arrival at your doorstep.
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
                backgroundColor: 'var(--white)',
                borderTop: '4px solid var(--black)',
                padding: '1rem 1.5rem',
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
                  padding: '0.9rem',
                  backgroundColor: '#e5e5e5',
                  color: 'var(--black)',
                  border: 'var(--border-thick)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px var(--black)'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handlePayNow}
                style={{
                  width: '65%',
                  padding: '1rem',
                  backgroundColor: 'var(--red)',
                  color: 'var(--white)',
                  border: 'var(--border-thick)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '4px 4px 0px var(--black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>PAY ₹{grandTotal} NOW</span>
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
