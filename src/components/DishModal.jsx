import { motion, AnimatePresence } from 'framer-motion';

export default function DishModal({ dish, onClose, onAddToCart }) {
  if (!dish) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--black)',
          zIndex: 9998
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(320px, 90vw, 600px)',
          backgroundColor: 'var(--cream)',
          color: 'var(--black)',
          border: 'var(--border-thick)',
          boxShadow: '16px 16px 0px var(--red)',
          zIndex: 9999,
          padding: '2.5rem'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--red)', display: 'block', marginBottom: '0.2rem' }}>
              {dish.hindiName || 'विशेषता'}
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', margin: 0, lineHeight: 0.9 }}>
              {dish.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--black)',
              color: 'var(--cream)',
              border: 'none',
              padding: '0.4rem 0.8rem',
              fontFamily: 'var(--font-display)',
              cursor: 'pointer'
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Dish Image */}
        <div style={{ border: 'var(--border-thick)', height: '220px', overflow: 'hidden', marginBottom: '1.5rem', backgroundColor: 'var(--white)' }}>
          <img
            src={dish.image || 'assets/meal-chicken.png'}
            alt={dish.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Details */}
        <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {dish.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <span style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)', padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem', border: 'var(--border-thick)' }}>
            🌶️ SPICE LEVEL: MEDIUM
          </span>
          <span style={{ backgroundColor: 'var(--green)', color: 'var(--white)', padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem', border: 'var(--border-thick)' }}>
            🌱 100% FRESH INGREDIENTS
          </span>
          <span style={{ backgroundColor: 'var(--blue)', color: 'var(--white)', padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem', border: 'var(--border-thick)' }}>
            🥜 GLUTEN FREE
          </span>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--red)' }}>
            {dish.price}
          </span>
          <button
            onClick={() => {
              onAddToCart(dish);
              onClose();
            }}
            className="btn-editorial"
            style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}
          >
            ADD TO ORDER +
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
