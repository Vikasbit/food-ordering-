import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService, orderService } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/currency';

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('NEW');

  // Load restaurant and initial orders
  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/seller/login');
      return;
    }

    async function load() {
      try {
        const rest = await marketplaceService.getSellerRestaurant(user.id);
        if (!rest) {
          navigate('/seller/restaurant');
          return;
        }
        setRestaurant(rest);
        
        const initialOrders = await orderService.getSellerOrders(rest.id);
        setOrders(initialOrders);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    load();
  }, [user, navigate]);

  // Realtime Subscription
  useEffect(() => {
    if (!restaurant) return;
    
    // This perfectly simulates Supabase Realtime across tabs!
    const unsubscribe = orderService.subscribeToRestaurantOrders(restaurant.id, async () => {
      // Re-fetch all orders to ensure we have latest state
      const updatedOrders = await orderService.getSellerOrders(restaurant.id);
      
      // Play a subtle sound or flash for new orders
      const newOrderCount = updatedOrders.filter(o => o.status === 'PENDING').length;
      const oldOrderCount = orders.filter(o => o.status === 'PENDING').length;
      
      if (newOrderCount > oldOrderCount) {
        // Optional sound: new Audio('/assets/bell.mp3').play().catch(() => {});
        console.log('🔔 New order received!');
      }
      
      setOrders(updatedOrders);
    });

    return () => unsubscribe();
  }, [restaurant, orders]);

  const handleStatusUpdate = async (orderId, newStatus, reason = null) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus, reason);
      // The local realtime subscription will automatically refresh the UI!
      // But we can also proactively update local state for speed.
      const updatedOrders = await orderService.getSellerOrders(restaurant.id);
      setOrders(updatedOrders);
    } catch (err) {
      alert(`Could not update order: ${err.message}`);
    }
  };

  const handleReject = (orderId) => {
    const reason = window.prompt("Reason for rejection? (e.g. Restaurant too busy)");
    if (reason) {
      handleStatusUpdate(orderId, 'CANCELLED', reason);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Orders...</div>;

  // Filter logic
  const TABS = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERY', 'COMPLETED', 'CANCELLED'];
  
  const getTabOrders = (tab) => {
    switch (tab) {
      case 'NEW': return orders.filter(o => o.status === 'PENDING');
      case 'ACCEPTED': return orders.filter(o => o.status === 'ACCEPTED');
      case 'PREPARING': return orders.filter(o => o.status === 'PREPARING');
      case 'READY': return orders.filter(o => o.status === 'READY_FOR_PICKUP');
      case 'DELIVERY': return orders.filter(o => ['DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status));
      case 'COMPLETED': return orders.filter(o => o.status === 'DELIVERED');
      case 'CANCELLED': return orders.filter(o => o.status === 'CANCELLED');
      default: return [];
    }
  };

  const currentTabOrders = getTabOrders(activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--black)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.5rem', fontSize: '2.5rem' }}>LIVE ORDERS</h1>
          <p style={{ margin: 0, color: '#666' }}>{restaurant?.name} Dashboard</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {TABS.map(tab => {
          const count = getTabOrders(tab).length;
          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: activeTab === tab ? 'var(--black)' : 'var(--white)',
                color: activeTab === tab ? 'var(--white)' : 'var(--black)',
                border: '2px solid var(--black)',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}
            >
              {tab} 
              <span style={{ 
                backgroundColor: activeTab === tab ? 'var(--red)' : '#eee', 
                color: activeTab === tab ? 'white' : 'black',
                padding: '0.1rem 0.5rem', 
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Order List */}
      {currentTabOrders.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--white)', border: '2px dashed #ccc' }}>
          No {activeTab.toLowerCase()} orders right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentTabOrders.map(order => (
            <div key={order.id} style={{ 
              backgroundColor: 'var(--white)', 
              border: '2px solid var(--black)', 
              boxShadow: '4px 4px 0px var(--black)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '2px solid var(--black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.2rem', fontSize: '1.2rem' }}>ORDER #{order.id}</h3>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatINR(order.amount)}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 'bold' }}>
                    {order.payment_status}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', color: '#666' }}>ITEMS ({order.items?.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    {order.items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span><strong style={{ display: 'inline-block', width: '24px' }}>{item.quantity}x</strong> {item.name}</span>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#666' }}>CUSTOMER</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>{order.delivery_location?.address}</strong>
                  </p>
                </div>

                {/* Actions Panel */}
                <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '0.8rem', justifyContent: 'center' }}>
                  
                  {order.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')} className="btn-editorial" style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--black)', color: 'white' }}>
                        ACCEPT ORDER
                      </button>
                      <button onClick={() => handleReject(order.id)} className="btn-editorial-outline" style={{ width: '100%', padding: '0.8rem', borderColor: 'var(--red)', color: 'var(--red)' }}>
                        REJECT
                      </button>
                    </>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <button onClick={() => handleStatusUpdate(order.id, 'PREPARING')} className="btn-editorial" style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--blue)', color: 'white' }}>
                      START PREPARING
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button onClick={() => handleStatusUpdate(order.id, 'READY_FOR_PICKUP')} className="btn-editorial" style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--green)', color: 'white' }}>
                      MARK READY
                    </button>
                  )}

                  {order.status === 'READY_FOR_PICKUP' && (
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e9', border: '1px solid var(--green)', fontWeight: 'bold', color: 'var(--green)' }}>
                      WAITING FOR DRIVER
                    </div>
                  )}

                  {['DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e3f2fd', border: '1px solid var(--blue)', fontWeight: 'bold', color: 'var(--blue)' }}>
                      <div>{order.status.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>{order.driver_name}</div>
                    </div>
                  )}

                  {order.status === 'DELIVERED' && (
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f5f5f5', border: '1px solid #ccc', fontWeight: 'bold', color: '#333' }}>
                      DELIVERED
                    </div>
                  )}

                  {order.status === 'CANCELLED' && (
                    <div style={{ color: 'var(--red)', fontSize: '0.9rem' }}>
                      <strong>Rejected:</strong> {order.rejection_reason}
                    </div>
                  )}
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
