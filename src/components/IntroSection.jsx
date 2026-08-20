import { motion } from 'framer-motion';

export default function IntroSection() {
  return (
    <section
      id="intro"
      style={{
        backgroundColor: '#F9F4E8',
        padding: '6rem 1rem',
        borderTop: 'var(--border-thick)',
        borderBottom: 'var(--border-thick)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}
    >
      {/* Background Subtle Radial Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at center, transparent 30%, rgba(242, 13, 13, 0.04) 100%), 
            repeating-conic-gradient(from 0deg, rgba(0, 0, 0, 0.02) 0deg 5deg, transparent 5deg 10deg)`,
          pointerEvents: 'none'
        }}
      />

      <div className="container-editorial" style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Devanagari Hindi Tagline "स्वादिष्ट घर का खाना" */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', 'Archivo Black', system-ui, sans-serif",
              fontSize: 'clamp(2.2rem, 5.5vw, 5rem)',
              fontWeight: 900,
              color: 'var(--black)',
              display: 'block',
              marginBottom: '1rem',
              letterSpacing: '-0.01em',
              lineHeight: 1.1
            }}
          >
            स्वादिष्ट घर का खाना।
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 6vw, 5.5rem)',
              color: 'var(--red)',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              marginBottom: '2rem'
            }}
          >
            FRESH HOMEMADE INDIAN DISHES<br />DELIVERED HOT TO YOUR DOOR.
          </h2>
        </motion.div>

        {/* Decorative Diya Vector Graphic */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            margin: '2rem auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ width: '80px', height: '80px' }}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 50 Q 50 10 90 50 Q 50 85 10 50 Z" fill="#F20D0D" stroke="#111" strokeWidth="3" />
              <path d="M50 15 Q 60 35 50 45 Q 40 35 50 15 Z" fill="#FFC400" />
            </svg>
          </div>
        </motion.div>



        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <a
            href="#our-story"
            className="btn-editorial"
            style={{
              backgroundColor: 'var(--red)',
              color: 'var(--white)',
              padding: '0.9rem 2.5rem',
              fontSize: '1rem',
              boxShadow: '4px 4px 0px var(--black)'
            }}
            data-cursor="EXPLORE"
          >
            THE RESTAURANT
          </a>

          <a
            href="#locations"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              color: 'var(--red)',
              textDecoration: 'none',
              borderBottom: '3px solid var(--red)',
              paddingBottom: '0.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            data-cursor="CONTACT"
          >
            CONTACT US
          </a>
        </motion.div>

      </div>
    </section>
  );
}
