import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menu';

export default function MenuSection({ onAddToCart, onOpenCart, onOpenExplore, onCustomizeDish }) {
  const [activeCategory, setActiveCategory] = useState('VEGETARIAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Filter items based on active category, search query, and veg-only toggle
  const filteredItems = useMemo(() => {
    const categoryItems = MENU_ITEMS[activeCategory] || [];
    return categoryItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = vegOnly ? item.isVeg : true;
      return matchesSearch && matchesVeg;
    });
  }, [activeCategory, searchQuery, vegOnly]);

  return (
    <section
      id="menu"
      style={{
        backgroundColor: 'var(--black)',
        color: 'var(--cream)',
        padding: '6rem 0',
        borderBottom: 'var(--border-thick)',
        position: 'relative'
      }}
    >
      <div className="container-editorial">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--yellow)', fontSize: '1rem', letterSpacing: '0.1em' }}>
            // ORDER FRESH FOOD ONLINE
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 8rem)', color: 'var(--red)', margin: '0.5rem 0' }}>
            THE MENU.
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--cream)', maxWidth: '540px', margin: '0 auto' }}>
            Filter by category, search by cravings, or toggle dietary preferences.
          </p>
        </div>

        {/* Swiggy/DoorDash Style Search & Filter Control Bar */}
        <div
          style={{
            backgroundColor: 'var(--cream)',
            color: 'var(--black)',
            border: 'var(--border-thick)',
            padding: '1.2rem',
            marginBottom: '2.5rem',
            boxShadow: '8px 8px 0px var(--red)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          {/* Live Search Input */}
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search dishes, ingredients, curries..."
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 2.6rem',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'var(--border-thick)',
                backgroundColor: 'var(--white)',
                color: 'var(--black)',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>
              🔍
            </span>
          </div>

          {/* Quick Swiggy / Zomato Filters */}
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setVegOnly(!vegOnly)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                padding: '0.7rem 1.2rem',
                border: 'var(--border-thick)',
                backgroundColor: vegOnly ? 'var(--green)' : 'var(--white)',
                color: vegOnly ? 'var(--white)' : 'var(--black)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>🌱</span>
              <span>VEG ONLY</span>
            </button>

            <button
              onClick={() => alert('Top Rated 4.5+ Filter Applied!')}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                padding: '0.7rem 1.2rem',
                border: 'var(--border-thick)',
                backgroundColor: 'var(--white)',
                color: 'var(--black)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>⭐</span>
              <span>RATED 4.5+</span>
            </button>

            <button
              onClick={() => alert('Fast Delivery under 25 min Filter Applied!')}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                padding: '0.7rem 1.2rem',
                border: 'var(--border-thick)',
                backgroundColor: 'var(--yellow)',
                color: 'var(--black)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>⚡</span>
              <span>UNDER 25 MIN</span>
            </button>
          </div>
        </div>

        {/* Category Tabs Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            justifyContent: 'center',
            marginBottom: '3rem'
          }}
        >
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery('');
              }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                padding: '0.8rem 1.6rem',
                border: 'var(--border-thick)',
                backgroundColor: activeCategory === cat ? 'var(--red)' : 'var(--cream)',
                color: activeCategory === cat ? 'var(--white)' : 'var(--black)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase'
              }}
              data-cursor="SELECT"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div
          style={{
            backgroundColor: 'var(--cream)',
            color: 'var(--black)',
            border: 'var(--border-thick)',
            padding: '3rem',
            boxShadow: '12px 12px 0px var(--red)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: 'var(--border-thick)', paddingBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--red)' }}>
              {activeCategory} SELECTION
            </h3>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', backgroundColor: 'var(--yellow)', padding: '0.3rem 0.8rem', border: 'var(--border-thick)' }}>
              {filteredItems.length} DISHES
            </span>
          </div>

          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>NO MATCHING DISHES FOUND</h4>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Try clearing your search query or toggling filters.</p>
              </div>
            ) : (
              <motion.div
                key={activeCategory + searchQuery + vegOnly}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}
              >
                {filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderBottom: '1px solid #ddd',
                      paddingBottom: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--black)' }}>
                          {item.name}
                        </h4>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--red)', whiteSpace: 'nowrap' }}>
                          {item.price}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: '#444', fontWeight: 500, lineHeight: 1.4, marginBottom: '1rem' }}>
                        {item.desc}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.isVeg ? 'var(--green)' : 'var(--red)', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {item.isVeg ? 'VEGETARIAN' : 'NON-VEG'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>• ⏱️ 20 MIN</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => onAddToCart({ ...item, id: item.name.toLowerCase().replace(/\s+/g, '-') })}
                          style={{
                            backgroundColor: 'var(--red)',
                            color: 'var(--white)',
                            border: 'var(--border-thick)',
                            padding: '0.3rem 0.6rem',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          + ADD
                        </button>
                        <button
                          onClick={() => onCustomizeDish && onCustomizeDish({ ...item, id: item.name.toLowerCase().replace(/\s+/g, '-') })}
                          style={{
                            backgroundColor: 'var(--yellow)',
                            color: 'var(--black)',
                            border: 'var(--border-thick)',
                            padding: '0.3rem 0.6rem',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          ⚙️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons: VIEW BAG & EXPLORE ALL FOODS */}
          <div
            style={{
              marginTop: '3rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <button onClick={onOpenCart} className="btn-editorial" data-cursor="ORDER">
              VIEW YOUR BAG / CHECKOUT →
            </button>

            <button
              onClick={onOpenExplore}
              className="btn-editorial-outline"
              style={{
                borderColor: 'var(--black)',
                color: 'var(--black)',
                backgroundColor: 'var(--yellow)',
                boxShadow: '4px 4px 0px var(--black)'
              }}
              data-cursor="EXPLORE"
            >
              EXPLORE ALL FOODS (FULL CATALOG) 🍽️
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
