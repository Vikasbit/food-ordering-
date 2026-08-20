import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, handleRemoveItem, handleUpdateQuantity } = useCart();

  const subtotal = cartItems.reduce((acc, item) => {
    const numericPrice = parseFloat(item.price?.toString().replace(/[^0-9.]/g, '')) || 0;
    return acc + numericPrice * (item.quantity || 1);
  }, 0);

  return (
    <div style={{ padding: '4rem 2rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--red)', marginBottom: '2rem' }}>
        YOUR ORDER BAG
      </h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', border: 'var(--border-thick)', backgroundColor: 'var(--white)' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🛍️</span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--black)' }}>
            YOUR BAG IS EMPTY
          </p>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem', marginBottom: '2rem' }}>
            Add some fresh homemade dishes from our menu to get started.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-editorial"
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
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
                  border: 'var(--border-thick)',
                  backgroundColor: 'var(--white)',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: 0 }}>
                    {item.name}
                  </h4>
                  <div style={{ color: 'var(--red)', fontWeight: 700, marginTop: '0.5rem', fontSize: '1.1rem' }}>
                    {String(item.price).includes('₹') ? item.price : `₹${String(item.price).replace(/[^0-9]/g, '')}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', border: 'var(--border-thick)', backgroundColor: 'var(--cream)', fontSize: '1.2rem' }}>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      style={{ border: 'none', background: 'none', padding: '0.5rem 1rem', fontWeight: 900, cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0.5rem 1rem', fontWeight: 700 }}>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      style={{ border: 'none', background: 'none', padding: '0.5rem 1rem', fontWeight: 900, cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    style={{ border: 'none', background: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: 'var(--border-thick)', paddingTop: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
              <span>SUBTOTAL</span>
              <span style={{ color: 'var(--red)' }}>₹{subtotal.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '30%',
                  padding: '1.2rem',
                  backgroundColor: 'var(--white)',
                  color: 'var(--black)',
                  border: 'var(--border-thick)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '4px 4px 0px var(--black)'
                }}
              >
                ← BACK TO MENU
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="btn-editorial"
                style={{
                  width: '70%',
                  fontSize: '1.2rem',
                  padding: '1.2rem',
                }}
              >
                PROCEED TO CHECKOUT 🛵
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
