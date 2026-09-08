import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menu';
import { formatINR } from '../utils/currency';

export default function ExploreAllModal({ isOpen, onClose, onAddToCart }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'VEG', 'NONVEG'

  // Flatten all items across all categories with exact authentic food photos
  const allDishes = useMemo(() => {
    const dishes = [];
    MENU_CATEGORIES.forEach((cat) => {
      (MENU_ITEMS[cat] || []).forEach((item) => {
        dishes.push({
          ...item,
          category: cat,
          image: item.image || (item.isVeg ? 'assets/palak-paneer-real.png' : 'assets/butter-chicken-real.png')
        });
      });
    });
    return dishes;
  }, []);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return allDishes.filter((dish) => {
      const matchesCategory = selectedCategory === 'ALL' || dish.category === selectedCategory;
      const matchesSearch =
        dish.name.toLowerCase().includes(search.toLowerCase()) ||
        dish.desc.toLowerCase().includes(search.toLowerCase()) ||
        dish.category.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        filterType === 'ALL' ? true : filterType === 'VEG' ? dish.isVeg : !dish.isVeg;

      return matchesCategory && matchesSearch && matchesType;
    });
  }, [allDishes, selectedCategory, search, filterType]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* 100% Fullscreen Editorial Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'var(--cream)',
          color: 'var(--black)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Fullscreen Header Bar */}
        <div
          style={{
            backgroundColor: 'var(--red)',
            color: 'var(--white)',
            padding: '1.2rem 2.5rem',
            borderBottom: 'var(--border-thick)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.15em', color: 'var(--yellow)' }}>
              // FULL CULINARY REPERTOIRE
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', margin: 0, lineHeight: 0.9 }}>
              EXPLORE ALL DISHES ({filteredDishes.length} ITEMS)
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'var(--black)',
              color: 'var(--cream)',
              border: 'var(--border-thick)',
              padding: '0.7rem 1.6rem',
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            ✕ CLOSE EXPLORER
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            padding: '1.2rem 2.5rem',
            borderBottom: 'var(--border-thick)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          {/* Live Search Input */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search all dishes, biryani, chicken, paneer, drinks..."
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '1rem',
                border: 'var(--border-thick)',
                outline: 'none',
                backgroundColor: 'var(--cream)'
              }}
            />
          </div>

          {/* Dietary Filter Buttons (ALL, VEG, NON-VEG) */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => setFilterType('ALL')}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                padding: '0.7rem 1.2rem',
                border: 'var(--border-thick)',
                backgroundColor: filterType === 'ALL' ? 'var(--black)' : 'var(--white)',
                color: filterType === 'ALL' ? 'var(--cream)' : 'var(--black)',
                cursor: 'pointer'
              }}
            >
              ALL DISHES
            </button>
            <button
              onClick={() => setFilterType('VEG')}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                padding: '0.7rem 1.2rem',
                border: 'var(--border-thick)',
                backgroundColor: filterType === 'VEG' ? 'var(--green)' : 'var(--white)',
                color: filterType === 'VEG' ? 'var(--white)' : 'var(--black)',
                cursor: 'pointer'
              }}
            >
              🌱 VEG ONLY
            </button>
            <button
              onClick={() => setFilterType('NONVEG')}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                padding: '0.7rem 1.2rem',
                border: 'var(--border-thick)',
                backgroundColor: filterType === 'NONVEG' ? 'var(--red)' : 'var(--white)',
                color: filterType === 'NONVEG' ? 'var(--white)' : 'var(--black)',
                cursor: 'pointer'
              }}
            >
              🍗 NON-VEG ONLY
            </button>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', maxWidth: '100%' }}>
            {['ALL', ...MENU_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  padding: '0.5rem 1rem',
                  border: 'var(--border-thick)',
                  backgroundColor: selectedCategory === cat ? 'var(--yellow)' : 'var(--cream)',
                  color: 'var(--black)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Dish Grid Catalog with Authentic Food Images */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2.5rem',
            backgroundColor: '#F9F4E8'
          }}
        >
          {filteredDishes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🍽️</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>NO MATCHING FOODS FOUND</h3>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>Try clearing your search term or switching filters.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: '2rem'
              }}
            >
              {filteredDishes.map((dish, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  style={{
                    backgroundColor: 'var(--white)',
                    border: 'var(--border-thick)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '6px 6px 0px var(--black)',
                    position: 'relative'
                  }}
                >
                  {/* Dish Image Container */}
                  <div
                    style={{
                      height: '200px',
                      backgroundColor: dish.isVeg ? 'var(--yellow)' : 'var(--green)',
                      border: 'var(--border-thick)',
                      marginBottom: '1.2rem',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--black)',
                        color: 'var(--cream)',
                        padding: '0.3rem 0.6rem',
                        border: '1px solid var(--cream)'
                      }}
                    >
                      {dish.category}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.85rem',
                        backgroundColor: dish.isVeg ? 'var(--green)' : 'var(--red)',
                        color: 'var(--white)',
                        padding: '0.3rem 0.6rem'
                      }}
                    >
                      {dish.isVeg ? '🌱 VEG' : '🍗 NON-VEG'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--black)', margin: 0 }}>
                        {dish.name}
                      </h4>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--red)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                        {formatINR(dish.price)}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: 1.4, marginBottom: '1.5rem', fontWeight: 500 }}>
                      {dish.desc}
                    </p>
                  </div>

                  {/* Bottom Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 700 }}>
                      ⏱️ 20 MIN • FRESH
                    </span>

                    <button
                      onClick={() => onAddToCart({ ...dish, id: dish.name.toLowerCase().replace(/\s+/g, '-') })}
                      className="btn-editorial"
                      style={{
                        backgroundColor: 'var(--red)',
                        color: 'var(--white)',
                        padding: '0.5rem 1.2rem',
                        fontSize: '0.9rem'
                      }}
                    >
                      + ADD TO BAG
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--cream)',
            padding: '1rem 2.5rem',
            borderTop: 'var(--border-thick)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>
            DISPLAYING {filteredDishes.length} OF {allDishes.length} DISHES (VEG &amp; NON-VEG)
          </span>
          <button
            onClick={onClose}
            className="btn-editorial"
            style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)', padding: '0.6rem 1.6rem', fontSize: '0.95rem' }}
          >
            BACK TO MAIN SITE ➔
          </button>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
