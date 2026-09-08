import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatINR, parsePrice } from '../utils/currency';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, handleRemoveItem, handleUpdateQuantity } = useCart();

  const subtotal = cartItems.reduce((acc, item) => {
    const numericPrice = parsePrice(item.price);
    return acc + numericPrice * (item.quantity || 1);
  }, 0);

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--red)', marginBottom: '2rem' }}>
        YOUR ORDER BAG
      </h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid #ECE7DF', borderRadius: '24px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🛍️</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--brand-dark)', margin: 0 }}>
            YOUR BAG IS EMPTY
          </h2>
          <p style={{ fontSize: '1rem', color: '#78716C', marginTop: '0.5rem', marginBottom: '2rem' }}>
            Add some fresh homemade dishes from our menu to get started.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '9999px' }}
          >
            BROWSE MENU
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #ECE7DF',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--brand-dark)', margin: 0 }}>
                    {item.name}
                  </h4>
                  <div style={{ color: 'var(--brand-primary)', fontWeight: 700, marginTop: '0.35rem', fontSize: '1.05rem' }}>
                    {formatINR(parsePrice(item.price))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECE7DF', borderRadius: '9999px', backgroundColor: '#FDFBF7', overflow: 'hidden' }}>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      style={{ border: 'none', background: 'none', padding: '0.45rem 0.85rem', fontWeight: 800, cursor: 'pointer', color: 'var(--brand-dark)', fontSize: '1rem' }}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span style={{ padding: '0 0.5rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', fontSize: '0.95rem' }}>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      style={{ border: 'none', background: 'none', padding: '0.45rem 0.85rem', fontWeight: 800, cursor: 'pointer', color: 'var(--brand-dark)', fontSize: '1rem' }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    style={{ border: 'none', background: 'none', color: '#A8A29E', cursor: 'pointer', fontSize: '1.25rem', padding: '0.3rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #ECE7DF', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            {/* Bill Summary Breakdown */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECE7DF', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 1.25rem', fontSize: '1.25rem', color: 'var(--brand-dark)', fontWeight: 700 }}>
                Bill Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.95rem', borderBottom: '1px solid #ECE7DF', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#57534E' }}>
                  <span>Food Subtotal</span>
                  <span style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>{formatINR(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#57534E' }}>
                  <span>Delivery Fee</span>
                  <span style={{ fontWeight: 600, color: (subtotal > 499 || subtotal === 0) ? '#16A34A' : 'var(--brand-dark)' }}>
                    {subtotal > 499 || subtotal === 0 ? 'FREE' : formatINR(39)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#57534E' }}>
                  <span>Estimated Tax (5% GST)</span>
                  <span style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>{formatINR(Math.round(subtotal * 0.05))}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.35rem', fontWeight: 800 }}>
                <span style={{ color: 'var(--brand-dark)' }}>Grand Total</span>
                <span style={{ color: 'var(--brand-primary)' }}>
                  {formatINR(subtotal + (subtotal > 499 || subtotal === 0 ? 0 : 39) + Math.round(subtotal * 0.05))}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '35%',
                  padding: '1rem',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--brand-dark)',
                  border: '1px solid #ECE7DF',
                  borderRadius: '14px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Back to Menu
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary"
                style={{
                  width: '65%',
                  fontSize: '1.05rem',
                  padding: '1rem',
                  borderRadius: '14px',
                  boxShadow: '0 8px 20px rgba(200,69,35,0.25)'
                }}
              >
                Proceed to Checkout 🛵
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
