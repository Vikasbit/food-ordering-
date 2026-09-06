import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService, orderService } from '../../lib/supabase';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const rest = await marketplaceService.getSellerRestaurant(user.id);
      if (!rest) {
        navigate('/seller/restaurant/setup');
        return;
      }
      setRestaurant(rest);
      // orderService may not be fully mocked for new sellers, safely ignore errors
      try {
        const ords = await orderService.getSellerOrders(rest.id);
        setOrders(ords || []);
      } catch (e) {}
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
  }

  if (!restaurant) {
    return null; 
  }

  let completedFields = 0;
  const requiredFields = ['name', 'description', 'phone', 'address', 'cuisine', 'logo_url', 'cover_url', 'opening_hours'];
  requiredFields.forEach(field => {
    if (restaurant[field]) completedFields++;
  });
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

  let totalItems = 0;
  let availableItems = 0;
  restaurant.categories?.forEach(c => {
    totalItems += c.items?.length || 0;
    availableItems += c.items?.filter(i => i.is_available).length || 0;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', margin: '0 0 0.5rem' }}>
            DASHBOARD
          </h1>
          <p style={{ margin: 0, opacity: 0.8 }}>Welcome back to BigBites Partner.</p>
        </div>
        <div>
          <span style={{ 
            display: 'inline-block',
            padding: '0.4rem 0.8rem',
            backgroundColor: restaurant.status === 'ACTIVE' ? 'var(--green)' : restaurant.status === 'DRAFT' ? '#ddd' : 'var(--yellow)',
            color: restaurant.status === 'ACTIVE' ? 'var(--white)' : 'var(--black)',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            border: '1px solid #111'
          }}>
            STATUS: {restaurant.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 1rem' }}>PROFILE COMPLETION</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            <span>Restaurant Setup</span>
            <span>{completionPercentage}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--cream)', border: '1px solid #ddd' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', backgroundColor: 'var(--yellow)' }}></div>
          </div>
          {completionPercentage < 100 && (
            <p style={{ margin: '1rem 0 0', fontSize: '0.85rem', color: 'var(--red)' }}>
              Add missing information (like photos) in the Restaurant section.
            </p>
          )}
        </div>

        <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 1rem' }}>MENU STATUS</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Total Categories:</span>
            <strong>{restaurant.categories?.length || 0}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Total Items:</span>
            <strong>{totalItems}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Available Items:</span>
            <strong style={{ color: 'var(--green)' }}>{availableItems}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 0.5rem' }}>LIVE ORDERS</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Order management is coming in the next phase.</p>
        </div>
      </div>
    </div>
  );
}
