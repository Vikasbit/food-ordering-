import { useState } from 'react';
import ImageWithFallback from './ImageWithFallback';

export default function RestaurantPageModal({
  isOpen,
  onClose,
  restaurant,
  cartItems = [],
  activeCartRestaurant,
  onAddToCart,
  onClearAndAddToCart
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartConflictModal, setCartConflictModal] = useState(null);

  if (!isOpen || !restaurant) return null;

  const categories = restaurant.categories || [];

  const handleAddItemClick = (item) => {
    // Check if cart has items from a different restaurant
    if (cartItems.length > 0 && activeCartRestaurant && activeCartRestaurant.id !== restaurant.id) {
      setCartConflictModal({
        existingRestaurantName: activeCartRestaurant.name,
        newRestaurantName: restaurant.name,
        pendingItem: item
      });
      return;
    }

    if (onAddToCart) {
      onAddToCart(item, restaurant);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.75)',
        zIndex: 2400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(6px)'
      }}
    >
      <div
        style={{
          backgroundColor: '#FAF8F5',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '920px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #ECE7DF'
        }}
      >
        {/* Restaurant Header */}
        <div
          style={{
            backgroundColor: '#1C1917',
            color: '#FFFFFF',
            padding: '1.75rem 2rem',
            position: 'relative',
            borderBottom: '1px solid #292524'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close restaurant menu"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #EA580C', flexShrink: 0 }}>
              <ImageWithFallback
                src={restaurant.logo_url || restaurant.cover_url}
                alt={restaurant.name}
                fallbackType="restaurant"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <span style={{ backgroundColor: '#059669', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  ★ {restaurant.rating || 4.5}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#A8A29E' }}>
                  ⏱️ {restaurant.prep_time_min || 20} mins prep
                </span>
              </div>
              <h2 style={{ margin: '0.2rem 0', fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#FFFFFF', fontWeight: 700 }}>
                {restaurant.name}
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#D6D3D1' }}>
                {restaurant.cuisine} • 🕒 {restaurant.opening_hours || '10:00 AM - 11:00 PM'}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#A8A29E' }}>
                📍 {restaurant.address}
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        {categories.length > 0 && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #ECE7DF',
              padding: '0.75rem 1.75rem',
              display: 'flex',
              gap: '0.6rem',
              overflowX: 'auto'
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: selectedCategory === null ? '1px solid var(--brand-primary)' : '1px solid #E5E0D8',
                backgroundColor: selectedCategory === null ? '#FFF7ED' : '#FFFFFF',
                color: selectedCategory === null ? 'var(--brand-primary)' : '#57534E',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: selectedCategory === cat.id ? '1px solid var(--brand-primary)' : '1px solid #E5E0D8',
                  backgroundColor: selectedCategory === cat.id ? '#FFF7ED' : '#FFFFFF',
                  color: selectedCategory === cat.id ? 'var(--brand-primary)' : '#57534E',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {categories.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#78716C' }}>
              No menu items published yet.
            </div>
          ) : (
            categories
              .filter((cat) => selectedCategory === null || cat.id === selectedCategory)
              .map((cat) => (
                <div key={cat.id} style={{ marginBottom: '2.5rem' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.35rem',
                      color: 'var(--brand-dark)',
                      borderBottom: '1px solid #ECE7DF',
                      paddingBottom: '0.5rem',
                      marginBottom: '1.25rem',
                      fontWeight: 700
                    }}
                  >
                    {cat.name} <span style={{ fontSize: '0.85rem', color: '#78716C', fontWeight: 500 }}>({cat.items?.length || 0})</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                    {cat.items?.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid #ECE7DF',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          padding: '1.2rem',
                          display: 'flex',
                          gap: '1.2rem',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem' }}>{item.is_veg ? '🌱 Veg' : '🍗 Non-Veg'}</span>
                            {item.is_bestseller && (
                              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                BESTSELLER
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: '0.2rem 0', fontFamily: 'var(--font-sans)', fontSize: '1.05rem', color: 'var(--brand-dark)', fontWeight: 700 }}>
                            {item.name}
                          </h4>
                          <span style={{ fontSize: '1.05rem', color: 'var(--brand-primary)', fontWeight: 800, display: 'block' }}>
                            ₹{item.price}
                          </span>
                          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#78716C', lineHeight: '1.4' }}>
                            {item.description}
                          </p>
                        </div>

                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '96px', height: '96px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #ECE7DF' }}>
                            <ImageWithFallback
                              src={item.image_url}
                              alt={item.name}
                              fallbackType="food"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddItemClick(item)}
                            className="btn-primary"
                            style={{
                              padding: '0.4rem 1.1rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              borderRadius: '8px'
                            }}
                          >
                            ADD +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Cart Conflict Modal (Strict Single-Restaurant Enforcement) */}
      {cartConflictModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 25, 23, 0.8)',
            zIndex: 2800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #ECE7DF',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.2)',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%'
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFF7ED', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
              ⚠️
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--brand-dark)', fontWeight: 700 }}>
              Your cart contains items from another restaurant
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#57534E', lineHeight: 1.5 }}>
              Your order currently has items from <strong>{cartConflictModal.existingRestaurantName}</strong>. A single order can only be placed from one restaurant at a time.
              <br /><br />
              Would you like to clear your current cart and start an order from <strong>{cartConflictModal.newRestaurantName}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCartConflictModal(null)}
                className="btn-outline"
                style={{ padding: '0.65rem 1.1rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Keep Current Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAndAddToCart) {
                    onClearAndAddToCart(cartConflictModal.pendingItem, restaurant);
                  } else if (onAddToCart) {
                    onAddToCart(cartConflictModal.pendingItem, restaurant);
                  }
                  setCartConflictModal(null);
                }}
                className="btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                Clear Cart &amp; Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
