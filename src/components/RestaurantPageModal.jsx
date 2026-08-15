import { useState } from 'react';

export default function RestaurantPageModal({
  isOpen,
  onClose,
  restaurant,
  cartItems,
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

    onAddToCart(item, restaurant);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 2400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--cream)',
          border: 'var(--border-thick)',
          boxShadow: '12px 12px 0px var(--black)',
          width: '100%',
          maxWidth: '900px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {/* Restaurant Header */}
        <div
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--cream)',
            padding: '1.5rem',
            position: 'relative',
            borderBottom: 'var(--border-thick)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1.2rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--cream)',
              fontSize: '1.6rem',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <img
              src={restaurant.logo_url || '/assets/indian-chef-kitchen.png'}
              alt={restaurant.name}
              style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid var(--yellow)' }}
            />
            <div>
              <span style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)', fontFamily: 'var(--font-display)', fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                ⭐ {restaurant.rating || 4.8} ({restaurant.reviews_count || 120}+ REVIEWS)
              </span>
              <h2 style={{ margin: '0.4rem 0 0.2rem', fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)' }}>
                {restaurant.name}
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, color: 'var(--yellow)' }}>
                {restaurant.cuisine} • 🕒 {restaurant.opening_hours || '10:00 AM - 11:00 PM'}
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
                📍 {restaurant.address}
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        {categories.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--white)',
              borderBottom: 'var(--border-thick)',
              padding: '0.8rem 1.5rem',
              display: 'flex',
              gap: '0.8rem',
              overflowX: 'auto'
            }}
          >
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '0.4rem 0.8rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                border: 'var(--border-thick)',
                backgroundColor: selectedCategory === null ? 'var(--yellow)' : 'var(--white)',
                cursor: 'pointer'
              }}
            >
              ALL ITEMS
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  border: 'var(--border-thick)',
                  backgroundColor: selectedCategory === cat.id ? 'var(--yellow)' : 'var(--white)',
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {categories.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
              NO MENU ITEMS PUBLISHED YET.
            </div>
          ) : (
            categories
              .filter((cat) => selectedCategory === null || cat.id === selectedCategory)
              .map((cat) => (
                <div key={cat.id} style={{ marginBottom: '2rem' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      color: 'var(--red)',
                      borderBottom: '2px solid var(--black)',
                      paddingBottom: '0.4rem',
                      marginBottom: '1rem'
                    }}
                  >
                    {cat.name} ({cat.items?.length || 0})
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.2rem' }}>
                    {cat.items?.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: 'var(--white)',
                          border: 'var(--border-thick)',
                          boxShadow: '4px 4px 0px var(--black)',
                          padding: '1.2rem',
                          display: 'flex',
                          gap: '1rem',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.9rem' }}>{item.is_veg ? '🌱' : '🍗'}</span>
                            {item.is_bestseller && (
                              <span style={{ backgroundColor: 'var(--red)', color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                BESTSELLER
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: '0.2rem 0', fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--black)' }}>
                            {item.name}
                          </h4>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--red)', display: 'block' }}>
                            ₹{item.price}
                          </span>
                          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#555', lineHeight: '1.3' }}>
                            {item.description}
                          </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <img
                            src={item.image_url || '/assets/butter-chicken-real.png'}
                            alt={item.name}
                            style={{ width: '90px', height: '90px', objectFit: 'cover', border: 'var(--border-thick)', marginBottom: '0.5rem' }}
                          />
                          <button
                            onClick={() => handleAddItemClick(item)}
                            className="btn-editorial"
                            style={{
                              backgroundColor: 'var(--yellow)',
                              color: 'var(--black)',
                              padding: '0.4rem 0.9rem',
                              fontSize: '0.8rem',
                              width: '100%'
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

      {/* Cart Conflict Modal */}
      {cartConflictModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 2800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: 'var(--border-thick)',
              boxShadow: '10px 10px 0px var(--black)',
              padding: '1.5rem',
              maxWidth: '440px',
              width: '100%',
              borderRadius: '4px'
            }}
          >
            <h3 style={{ margin: '0 0 0.8rem', fontFamily: 'var(--font-display)', color: 'var(--red)' }}>
              ⚠️ REPLACE CART ITEMS?
            </h3>
            <p style={{ margin: '0 0 1.2rem', fontSize: '0.9rem', color: 'var(--black)' }}>
              Your cart currently contains items from <strong>{cartConflictModal.existingRestaurantName}</strong>.
              <br /><br />
              Would you like to clear your cart and start a new order from <strong>{cartConflictModal.newRestaurantName}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setCartConflictModal(null)}
                className="btn-editorial-outline"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  onClearAndAddToCart(cartConflictModal.pendingItem, restaurant);
                  setCartConflictModal(null);
                }}
                className="btn-editorial"
                style={{ backgroundColor: 'var(--red)', color: 'var(--white)', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                CLEAR CART & CONTINUE →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
