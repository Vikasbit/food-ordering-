import { useState } from 'react';
import { motion, AnimatePresence } from 'react';
import { X, QrCode, CreditCard, CheckCircle2, Loader2, DollarSign, Smartphone, AlertCircle, ArrowRight } from 'lucide-react';
import { findNearestServingKitchen } from '../services/deliveryZoneService';

export default function PaymentGatewayModal({ isOpen, onClose, cartItems = [], deliveryLocation, onPaymentSuccess }) {
  const [activeTab, setActiveTab] = useState('upi_qr'); // upi_qr, upi_id, card, cod
  const [upiIdInput, setUpiIdInput] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if (!isOpen) return null;

  const nearestMatch = findNearestServingKitchen(deliveryLocation?.lat, deliveryLocation?.lng);

  const subtotal = cartItems.reduce((acc, item) => {
    const numericPrice = parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0;
    return acc + numericPrice * item.quantity;
  }, 0);

  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  const deliveryFee = subtotal >= 300 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + gstAmount + deliveryFee;

  const handlePayNow = () => {
    if (!nearestMatch.isDeliverable) {
      alert(`Cannot process checkout: Delivery address is outside our kitchen service zones (${nearestMatch.distanceKm} km away). Please select a deliverable location.`);
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
        onClose();
        setPaymentDone(false);
      }, 1200);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[var(--cream)] border-4 border-black shadow-[10px_10px_0px_#111] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-[var(--green)] border-b-4 border-black p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--yellow)] text-black border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#111]">
                🔒
              </div>
              <div>
                <h2 className="font-black text-xl tracking-tight uppercase leading-none text-white">
                  CHECKOUT & PAYMENT GATEWAY
                </h2>
                <p className="text-xs font-bold text-[var(--yellow)] mt-0.5">
                  100% SECURE ENCRYPTED TRANSACTION
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white text-black border-2 border-black font-extrabold text-lg shadow-[2px_2px_0px_#111] hover:bg-black hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {processing ? (
            /* Processing State Overlay */
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-16 h-16 animate-spin text-[var(--red)]" />
              <h3 className="font-black text-2xl uppercase">PROCESSING PAYMENT...</h3>
              <p className="text-sm font-bold text-gray-600">Contacting bank & verifying transaction token...</p>
              <div className="bg-[var(--yellow)] border-2 border-black px-4 py-2 font-black text-sm">
                PLEASE DO NOT REFRESH OR CLOSE THIS WINDOW ⚠️
              </div>
            </div>
          ) : paymentDone ? (
            /* Payment Success Overlay */
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <CheckCircle2 className="w-20 h-20 text-[var(--green)] animate-bounce" />
              <h3 className="font-black text-3xl text-[var(--green)] uppercase">PAYMENT SUCCESSFUL! 🎉</h3>
              <p className="text-base font-extrabold text-black">₹{grandTotal} RECEIVED. CREATING ORDER & ASSIGNING RIDER.</p>
            </div>
          ) : (
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              
              {/* Delivery Destination & Serving Kitchen Match Card */}
              <div className="bg-white border-3 border-black p-3.5 shadow-[3px_3px_0px_#111] space-y-2">
                <div className="flex items-center justify-between text-xs font-black uppercase text-gray-500">
                  <span>DELIVERY DESTINATION & MATCHED KITCHEN</span>
                  <span className="text-[var(--green)]">✅ ZONE VERIFIED</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-[var(--cream)] p-2.5 border-2 border-black">
                    <span className="font-black text-[var(--red)] block text-[10px]">DELIVERING TO:</span>
                    <span className="font-extrabold text-black block truncate">{deliveryLocation?.address || 'Connaught Place, New Delhi'}</span>
                    <span className="text-[10px] text-gray-600">Label: {deliveryLocation?.label || 'HOME'}</span>
                  </div>

                  <div className="bg-[var(--cream)] p-2.5 border-2 border-black">
                    <span className="font-black text-[var(--green)] block text-[10px]">PREPARED BY:</span>
                    <span className="font-extrabold text-black block truncate">{nearestMatch.selectedKitchen.name}</span>
                    <span className="text-[10px] text-gray-600">ETA: ~{nearestMatch.totalEtaMin} min ({nearestMatch.distanceKm} km away)</span>
                  </div>
                </div>
              </div>

              {/* Itemized Order Breakdown Box */}
              <div className="bg-white border-3 border-black p-3.5 shadow-[3px_3px_0px_#111]">
                <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>ORDER SUMMARY ({cartItems.length} ITEMS)</span>
                  <span className="text-[var(--red)] font-extrabold">GST INVOICE READY</span>
                </div>
                <div className="space-y-1.5 border-b-2 border-dashed border-gray-300 pb-2 max-h-28 overflow-y-auto text-xs font-extrabold">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 text-xs font-bold space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST Tax (5%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'FREE 🚚' : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-black pt-1 border-t-2 border-black">
                    <span>GRAND TOTAL</span>
                    <span className="text-[var(--red)] font-black text-lg">₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div>
                <div className="text-xs font-black uppercase text-gray-800 mb-2">
                  SELECT PAYMENT METHOD
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setActiveTab('upi_qr')}
                    className={`p-2.5 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#111] transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'upi_qr' ? 'bg-[var(--yellow)] text-black' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>UPI SCAN & PAY</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('upi_id')}
                    className={`p-2.5 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#111] transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'upi_id' ? 'bg-[var(--yellow)] text-black' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>UPI VPA ID</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('card')}
                    className={`p-2.5 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#111] transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'card' ? 'bg-[var(--yellow)] text-black' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>DEBIT / CREDIT</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('cod')}
                    className={`p-2.5 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#111] transition-all flex flex-col items-center gap-1 ${
                      activeTab === 'cod' ? 'bg-[var(--yellow)] text-black' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>CASH ON DELIVERY</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: UPI QR Code */}
              {activeTab === 'upi_qr' && (
                <div className="bg-white border-3 border-black p-4 shadow-[3px_3px_0px_#111] text-center flex flex-col items-center space-y-3">
                  <div className="border-4 border-black p-2 bg-white shadow-[3px_3px_0px_#111]">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=eatnaked@upi&pn=EATnakedKitchen&am=100&cu=INR"
                      alt="UPI QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <div className="text-xs font-black text-black">
                    SCAN WITH ANY UPI APP (GPAY, PHONEPE, PAYTM, CRED)
                  </div>
                </div>
              )}

              {/* Tab 2: UPI ID */}
              {activeTab === 'upi_id' && (
                <div className="bg-white border-3 border-black p-4 shadow-[3px_3px_0px_#111] space-y-3">
                  <label className="text-xs font-black uppercase text-black block">ENTER YOUR UPI ID (VPA)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. 9876543210@ybl or name@okicici"
                      className="flex-1 p-3 bg-[var(--cream)] border-2 border-black font-extrabold text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Card Payment */}
              {activeTab === 'card' && (
                <div className="bg-white border-3 border-black p-4 shadow-[3px_3px_0px_#111] space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase block mb-1">CARDHOLDER NAME</label>
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="w-full p-2.5 bg-[var(--cream)] border-2 border-black text-xs font-extrabold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase block mb-1">CARD NUMBER</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8829"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full p-2.5 bg-[var(--cream)] border-2 border-black text-xs font-extrabold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Cash on Delivery */}
              {activeTab === 'cod' && (
                <div className="bg-amber-50 border-3 border-black p-4 shadow-[3px_3px_0px_#111] space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm text-black">
                    <AlertCircle className="w-5 h-5 text-[var(--red)] shrink-0" />
                    CASH ON DELIVERY (COD) SELECTED
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    Pay <span className="font-extrabold text-[var(--red)]">₹{grandTotal}</span> in cash or scan driver QR code upon arrival at your doorstep.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Pay Button */}
          {!processing && !paymentDone && (
            <div className="bg-white border-t-4 border-black p-4 flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="w-1/3 py-3 bg-gray-200 text-black border-3 border-black font-extrabold text-sm uppercase shadow-[3px_3px_0px_#111] hover:bg-black hover:text-white transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handlePayNow}
                className="w-2/3 py-3.5 bg-[var(--red)] text-white border-3 border-black font-black text-base uppercase shadow-[4px_4px_0px_#111] hover:bg-[var(--yellow)] hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <span>PAY ₹{grandTotal} NOW</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
