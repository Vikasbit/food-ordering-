import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose, cartItems, onRemoveItem, onUpdateQuantity, onPlaceOrder }) {
  const subtotal = cartItems.reduce((acc, item) => {
    const numericPrice = parseFloat(item.price?.toString().replace(/[^0-9.]/g, '')) || 0;
    return acc + numericPrice * item.quantity;
  }, 0);

  const handleCheckout = () => {
    onClose();
    if (onPlaceOrder) {
      onPlaceOrder();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'var(--black)',
              zIndex: 9998
            }}
          />

          {/* Side Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'clamp(320px, 90vw, 460px)',
              backgroundColor: 'var(--cream)',
              color: 'var(--black)',
              borderLeft: 'var(--border-thick)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '2rem'
            }}
          >
            {/* Drawer Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'var(--border-thick)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--red)', margin: 0 }}>
                  YOUR ORDER BAG
                </h3>
                <button
                  onClick={onClose}
                  style={{
                    background: 'var(--black)',
                    color: 'var(--cream)',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    fontFamily: 'var(--font-display)',
                    cursor: 'pointer'
                  }}
                >
                  ✕ CLOSE
                </button>
              </div>

              {/* Cart Items List */}
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛍️</span>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--black)' }}>
                    YOUR BAG IS EMPTY
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '0.5rem' }}>
                    Add some fresh homemade dishes from our menu to get started.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: 'var(--border-thick)',
                        backgroundColor: 'var(--white)',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0 }}>
                          {item.name}
                        </h4>
                        <div style={{ color: 'var(--red)', fontWeight: 700, marginTop: '0.2rem' }}>
                          {item.price.includes('₹') ? item.price : `₹${item.price.replace(/[^0-9]/g, '')}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', border: 'var(--border-thick)', backgroundColor: 'var(--cream)' }}>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            style={{ border: 'none', background: 'none', padding: '0.2rem 0.6rem', fontWeight: 900, cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <span style={{ padding: '0.2rem 0.5rem', fontWeight: 700 }}>{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            style={{ border: 'none', background: 'none', padding: '0.2rem 0.6rem', fontWeight: 900, cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          style={{ border: 'none', background: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            <div style={{ borderTop: 'var(--border-thick)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                <span>SUBTOTAL</span>
                <span style={{ color: 'var(--red)' }}>₹{subtotal.toFixed(0)}</span>
              </div>
              <button
                disabled={cartItems.length === 0}
                onClick={handleCheckout}
                className="btn-editorial"
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  padding: '1rem',
                  opacity: cartItems.length === 0 ? 0.5 : 1,
                  cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                PROCEED TO CHECKOUT & TRACK ORDER 🛵
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
