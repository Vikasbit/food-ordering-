import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  items = [],
  onRemoveItem,
  onUpdateQuantity,
  onPlaceOrder,
  onOpenCheckout
}) {
  const activeItems = cartItems.length > 0 ? cartItems : items;

  const subtotal = activeItems.reduce((acc, item) => {
    const numericPrice = typeof item.rawPrice === 'number' ? item.rawPrice : parseFloat(item.price?.toString().replace(/[^0-9.]/g, '')) || 0;
    return acc + numericPrice * (item.quantity || 1);
  }, 0);

  const deliveryFee = subtotal > 30 || subtotal === 0 ? 0 : 2.99;
  const grandTotal = subtotal + (subtotal > 0 ? deliveryFee : 0);

  const handleCheckout = () => {
    onClose();
    if (onOpenCheckout) {
      onOpenCheckout();
    } else if (onPlaceOrder) {
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
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(28, 25, 23, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998
            }}
          />

          {/* Side Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'clamp(320px, 92vw, 440px)',
              backgroundColor: '#FFFFFF',
              color: 'var(--brand-dark)',
              borderLeft: '1px solid #ECE7DF',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.75rem'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #EFEAE2',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF7ED',
                      color: 'var(--brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: 'var(--brand-dark)',
                        margin: 0
                      }}
                    >
                      Your Order Bag
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#78716C' }}>
                      {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  style={{
                    background: '#FAF5EE',
                    border: '1px solid #ECE7DF',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#78716C'
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Items List */}
              {activeItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', margin: 'auto' }}>
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      backgroundColor: '#FAF5EE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      fontSize: '2rem'
                    }}
                  >
                    🛍️
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--brand-dark)', margin: '0 0 0.4rem' }}>
                    Your bag is empty
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#78716C', maxWidth: '240px', margin: '0 auto' }}>
                    Explore our menu and add your favorite dishes to get started!
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem',
                    paddingRight: '0.4rem'
                  }}
                >
                  {activeItems.map((item, idx) => {
                    const priceNum = typeof item.rawPrice === 'number' ? item.rawPrice : parseFloat(item.price?.toString().replace(/[^0-9.]/g, '')) || 0;
                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          borderRadius: '16px',
                          border: '1px solid #EFEAE2',
                          backgroundColor: '#FDFBF7',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.9rem'
                        }}
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '12px',
                              objectFit: 'cover'
                            }}
                          />
                        )}

                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.15rem', color: 'var(--brand-dark)' }}>
                            {item.name}
                          </h4>
                          <div style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.88rem' }}>
                            ${priceNum.toFixed(2)}
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '9999px',
                            border: '1px solid #ECE7DF',
                            padding: '0.15rem'
                          }}
                        >
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--brand-dark)'
                            }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span style={{ padding: '0 0.35rem', fontWeight: 700, fontSize: '0.85rem' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--brand-dark)'
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#A8A29E',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A29E')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {activeItems.length > 0 && (
              <div
                style={{
                  borderTop: '1px solid #EFEAE2',
                  paddingTop: '1.25rem',
                  marginTop: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#78716C', marginBottom: '0.4rem' }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#78716C', marginBottom: '0.75rem' }}>
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--brand-dark)'
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: 'var(--brand-primary)' }}>${grandTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.95rem',
                    fontSize: '0.98rem'
                  }}
                >
                  Proceed to Checkout 🛵
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
