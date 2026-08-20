import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../lib/supabase';
import RestaurantPageModal from '../../components/RestaurantPageModal';

export default function RestaurantPreviewPage() {
  const { user } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const rest = await marketplaceService.getSellerRestaurant(user.id);
      setRestaurant(rest);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading preview...</div>;
  if (!restaurant) return <div style={{ padding: '2rem' }}>Please complete restaurant setup first.</div>;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* We are rendering the modal directly inline or fully expanded, but since RestaurantPageModal expects to be a modal overlay over the screen, we'll just render it as a fake "open" state, but without the absolute positioning over the whole screen if possible. 
      Wait, RestaurantPageModal uses fixed positioning. We will just render it with a custom inline prop or we can just trigger it. */}
      
      <div style={{ padding: '2rem', maxWidth: '800px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', margin: '0 0 1rem' }}>
          LIVE PREVIEW
        </h1>
        <p style={{ margin: '0 0 2rem' }}>This is exactly how customers will see your restaurant when they click on it.</p>
        
        {/* We mount the modal, forcing it open, but we need to prevent it from closing */}
        <div style={{ position: 'relative', width: '100%', height: '700px', border: 'var(--border-thick)', overflow: 'hidden' }}>
          {/* We use an iframe or we modify the modal to support inline rendering.
              Since we shouldn't modify the customer UI if possible, we can just overlay it but bound to this div.
              Actually, RestaurantPageModal uses position: fixed. It will cover the whole screen.
              Let's just use a button to trigger it. */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: 'var(--cream)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '0 0 1rem' }}>Ready to view?</h2>
            <button 
              onClick={() => document.getElementById('preview-trigger').click()}
              className="btn-editorial" 
              style={{ padding: '1rem 2rem', backgroundColor: 'var(--black)', color: 'var(--white)', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              OPEN FULLSCREEN PREVIEW
            </button>
          </div>
        </div>
      </div>

      <RestaurantPageModal 
        isOpen={false} // Managed by state below
        onClose={() => {}} // We'll manage this
        restaurant={restaurant}
        onAddToCart={() => alert('Mock Add to Cart - Preview Mode')}
      />

      <PreviewWrapper restaurant={restaurant} />
    </div>
  );
}

// A small wrapper to handle the state cleanly without re-rendering the whole page
function PreviewWrapper({ restaurant }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button id="preview-trigger" style={{ display: 'none' }} onClick={() => setOpen(true)}></button>
      <RestaurantPageModal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        restaurant={restaurant}
        onAddToCart={() => alert('Add to cart works! (Preview)')}
      />
    </>
  );
}
