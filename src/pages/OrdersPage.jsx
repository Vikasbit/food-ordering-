import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // In a real app we'd fetch this from the backend
    // Since we're using mock local storage for the DB:
    const allOrders = JSON.parse(localStorage.getItem('bigbites_db_orders') || '[]');
    // Filter to authenticated user and filter out ones that didn't complete payment
    const myOrders = allOrders
      .filter(o => o.customer_id === user.id && o.payment_status === 'CAPTURED')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
    setOrders(myOrders);
    setLoading(false);
  }, [user, navigate]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--black)', marginBottom: '2rem' }}>
          MY ORDERS
        </h1>

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'var(--white)', padding: '4rem 2rem', textAlign: 'center', border: 'var(--border-thick)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1rem' }}>NO ORDERS YET</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>You haven't placed any orders with BigBites yet.</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn-editorial"
              style={{ padding: '1rem 2rem', backgroundColor: 'var(--red)', color: 'var(--white)', fontSize: '1rem' }}
            >
              BROWSE RESTAURANTS
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ backgroundColor: 'var(--white)', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.2rem', fontSize: '1.2rem' }}>
                      ORDER #{order.id}
                    </h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatINR(order.amount)}</span>
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: order.status === 'PENDING' ? 'var(--yellow)' : 'var(--green)' }}></span>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{order.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                      {order.items?.length || 0} items delivered to {order.delivery_location?.label || 'HOME'}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="btn-editorial-outline"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', backgroundColor: 'transparent' }}
                  >
                    VIEW ORDER →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
