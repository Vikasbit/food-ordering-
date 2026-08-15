import { motion } from 'framer-motion';

export default function BigTypeSection() {
  return (
    <section
      style={{
        backgroundColor: '#F9F4E8',
        color: 'var(--red)',
        padding: '6rem 0',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: 'var(--border-thick)',
        textAlign: 'center'
      }}
    >
      <div className="container-editorial" style={{ position: 'relative' }}>
        
        {/* Button tag matching Screenshot 3 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: '2.5rem' }}
        >
          <a
            href="#menu"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--red)',
              color: 'var(--yellow)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.95rem',
              padding: '0.5rem 1.4rem',
              border: 'var(--border-thick)',
              textDecoration: 'none',
              letterSpacing: '0.05em'
            }}
            data-cursor="MENU"
          >
            EXPLORE FULL MENU & CATERING
          </a>
        </motion.div>

        {/* GIANT RED TYPOGRAPHY 'SHOP' with Peacock Emblem replacing the letter 'O' */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(4rem, 14vw, 15rem)',
            lineHeight: 0.8,
            textTransform: 'uppercase'
          }}
        >
          <span>S</span>
          <span>H</span>
          
          {/* Peacock Emblem replacing 'O' */}
          <div
            style={{
              width: 'clamp(70px, 12vw, 160px)',
              height: 'clamp(70px, 12vw, 160px)',
              borderRadius: '50%',
              backgroundColor: 'var(--red)',
              color: '#F9F4E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'var(--border-thick)',
              position: 'relative'
            }}
          >
            <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="35" r="14" />
              <path d="M50 49 C35 65 30 85 50 95 C70 85 65 65 50 49 Z" />
              <circle cx="35" cy="20" r="4" />
              <circle cx="50" cy="15" r="4" />
              <circle cx="65" cy="20" r="4" />
              <line x1="50" y1="35" x2="35" y2="20" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="35" x2="50" y2="15" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="35" x2="65" y2="20" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <span>P</span>
        </div>

      </div>
    </section>
  );
}
