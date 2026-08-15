import { motion } from 'framer-motion';

export default function KitchenSection() {
  return (
    <section
      style={{
        backgroundColor: '#F9F4E8',
        padding: '6rem 0',
        borderBottom: 'var(--border-thick)',
        position: 'relative'
      }}
    >
      <div className="container-editorial">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center'
          }}
          className="kitchen-grid"
        >
          {/* Left Column: Authentic Indian Chef Photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              border: 'var(--border-thick)',
              backgroundColor: 'var(--yellow)',
              padding: '1rem',
              boxShadow: '12px 12px 0px var(--red)',
              position: 'relative'
            }}
          >
            <img
              src="/assets/indian-chef-kitchen.png"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80';
              }}
              alt="Authentic Master Indian Chef Cooking Over Flames"
              style={{
                width: '100%',
                height: '440px',
                objectFit: 'cover',
                display: 'block',
                border: 'var(--border-thick)'
              }}
            />
          </motion.div>

          {/* Right Column: Craftsmanship & Passion Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--red)',
                fontSize: '0.9rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block'
              }}
            >
              // CRAFTSMANSHIP &amp; PASSION
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                color: 'var(--black)',
                lineHeight: 0.95,
                margin: '0.8rem 0 1.5rem 0',
                textTransform: 'uppercase'
              }}
            >
              REAL FLAMES.<br />
              REAL SPICES.<br />
              NO SHORTCUTS.
            </h2>
            <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: '#333', marginBottom: '2rem' }}>
              From slow-simmering dal makhani overnight to hand-stretching garlic naans inside a red-hot clay tandoor oven, our kitchens operate with uncompromised dedication to regional Indian flavors.
            </p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', margin: 0 }}>100%</h4>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>FRESH INGREDIENTS DAILY</span>
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--black)', margin: 0 }}>0%</h4>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>ARTIFICIAL FLAVORS</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .kitchen-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
