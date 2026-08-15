import { motion } from 'framer-motion';

export default function Hero({ onOpenCart, onOpenOrderTracking }) {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: 'var(--cream)',
        paddingTop: '7.5rem',
        paddingBottom: '4rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div className="container-editorial" style={{ width: '100%', position: 'relative', zIndex: 2 }}>
        
        {/* Top Zomato/Swiggy-Style Serving Kitchen & Delivery Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Matched Serving Kitchen Hub Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: 'var(--white)',
              border: 'var(--border-thick)',
              padding: '0.55rem 1rem',
              boxShadow: '3px 3px 0px var(--black)'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🍳</span>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--red)', display: 'block', textTransform: 'uppercase' }}>
                SERVED BY CLOUD HUB
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--black)' }}>
                EATnaked Flagship Kitchen • 4.9 ★
              </span>
            </div>
          </div>

          {/* Live Order Tracking Button */}
          <button
            onClick={onOpenOrderTracking}
            style={{
              backgroundColor: 'var(--green)',
              color: 'var(--white)',
              border: 'var(--border-thick)',
              padding: '0.6rem 1rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '3px 3px 0px var(--black)'
            }}
          >
            <span>🛵 LIVE TRACKING</span>
            <span>•</span>
            <span>24 MIN ETA</span>
          </button>

          {/* Promo Code Badge */}
          <div
            style={{
              backgroundColor: 'var(--red)',
              color: 'var(--white)',
              border: 'var(--border-thick)',
              padding: '0.65rem 1rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              boxShadow: '3px 3px 0px var(--black)'
            }}
          >
            🎉 CODE: EAT50 (50% OFF)
          </div>
        </motion.div>

        {/* GIANT EDITORIAL HEADLINE */}
        <div style={{ position: 'relative' }}>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 9.5vw, 9.5rem)',
              color: 'var(--red)',
              lineHeight: 0.9,
              textTransform: 'uppercase',
              wordBreak: 'break-word',
              letterSpacing: '-0.03em',
              margin: 0
            }}
          >
            EAT LOCAL,<br />
            EAT INDIAN,<br />
            EAT NAKED.
          </motion.h1>

          {/* Floating Badge */}
          <motion.div
            className="animate-spin-slow"
            style={{
              position: 'absolute',
              top: '5%',
              right: '8%',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--black)',
              color: 'var(--cream)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              textAlign: 'center',
              padding: '0.5rem',
              border: 'var(--border-thick)'
            }}
          >
            ★ 100% HOMEMADE ★ NO PRESERVATIVES ★
          </motion.div>
        </div>

        {/* Hero Content & Food Photography Layout */}
        <div
          style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '2rem',
            alignItems: 'end'
          }}
        >
          {/* Left Column: Description & Delivery Action */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ gridColumn: 'span 6' }}
            className="hero-left-col"
          >
            <p
              style={{
                fontSize: '1.35rem',
                fontWeight: 600,
                maxWidth: '480px',
                marginBottom: '2rem',
                color: 'var(--black)'
              }}
            >
              Authentic Indian regional home recipes, crafted fresh with bold spices and uncompromised attitude. Delivered hot to your doorstep in under 30 minutes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#menu" className="btn-editorial" data-cursor="ORDER">
                ORDER NOW →
              </a>
              <button
                onClick={onOpenCart}
                className="btn-editorial-outline"
                data-cursor="CART"
              >
                VIEW CART 🛍️
              </button>
            </div>
          </motion.div>

          {/* Right Column: Editorial Food Cutout Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ gridColumn: 'span 6', position: 'relative' }}
            className="hero-right-col"
          >
            <div
              style={{
                border: 'var(--border-thick)',
                backgroundColor: 'var(--green)',
                padding: '1rem',
                boxShadow: '12px 12px 0px var(--black)',
                position: 'relative'
              }}
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzs6zoNqsUCjEvKYe-Cu1wqNcCeDqESA16SBy5EGm1nQhmpdj8N06053aK&s=10"
                alt="EATnaked Indian Chicken Curry"
                style={{
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  display: 'block',
                  border: 'var(--border-thick)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-15px',
                  left: '20px',
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--black)',
                  padding: '0.4rem 1rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                  border: 'var(--border-thick)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>⭐ 4.9 (1.2k+)</span>
                <span>•</span>
                <span>INDIAN CHICKEN CURRY</span>
              </div>
            </div>

            {/* Playful Floating Badge */}
            <div
              className="animate-float"
              style={{
                position: 'absolute',
                top: '-30px',
                left: '-30px',
                backgroundColor: 'var(--red)',
                color: 'var(--white)',
                padding: '0.8rem 1.2rem',
                border: 'var(--border-thick)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                transform: 'rotate(-8deg)'
              }}
            >
              🔥 TOP RATED!
            </div>
          </motion.div>

        </div>
      </div>

      {/* Ticker Marquee Banner */}
      <div className="marquee-container" style={{ marginTop: '4rem' }}>
        <div className="marquee-content">
          <span className="marquee-item">⚡ 30 MIN EXPRESS DELIVERY</span> ★
          <span className="marquee-item">⭐ 4.9 STAR RATED MEALS</span> ★
          <span className="marquee-item">🌱 100% ORGANIC SPICES</span> ★
          <span className="marquee-item">📦 ZERO WASTE PACKAGING</span> ★
          <span className="marquee-item">⚡ 30 MIN EXPRESS DELIVERY</span> ★
          <span className="marquee-item">⭐ 4.9 STAR RATED MEALS</span> ★
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-left-col, .hero-right-col {
            grid-column: span 12 !important;
          }
        }
        @media (max-width: 640px) {
          #hero {
            padding-top: 6rem !important;
            padding-bottom: 2.5rem !important;
          }
          .hero-right-col img {
            height: 260px !important;
          }
          .hero-left-col p {
            font-size: 1.1rem !important;
            margin-bottom: 1.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
