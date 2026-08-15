import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function JourneySection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Smooth horizontal scroll position for the Tuk Tuk
  const truckX = useTransform(scrollYProgress, [0, 1], ['-15%', '110%']);

  return (
    <section
      ref={containerRef}
      style={{
        backgroundColor: '#F9F4E8',
        padding: '5rem 0',
        borderBottom: 'var(--border-thick)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container-editorial">
        
        {/* Main Red Framed Container */}
        <div
          style={{
            border: 'var(--border-red)',
            backgroundColor: '#F9F4E8',
            position: 'relative'
          }}
        >
          
          {/* Top Section with Enhanced Auto-Rickshaw + TO INDIA */}
          <div
            style={{
              padding: '4rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '280px'
            }}
          >
            {/* Animated Indian Auto-Rickshaw (Tuk Tuk) with bouncing suspension */}
            <motion.div
              style={{
                position: 'absolute',
                left: 0,
                x: truckX,
                zIndex: 3,
                bottom: '20px'
              }}
            >
              <div className="animate-bounce" style={{ fontSize: '3.5rem' }}>
                🛺
              </div>
            </motion.div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(4rem, 16vw, 16rem)',
                color: 'var(--red)',
                lineHeight: 0.8,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                userSelect: 'none',
                position: 'relative',
                zIndex: 1
              }}
            >
              TO INDIA
            </h2>
          </div>

          {/* Bottom Sub-grid in English: DINE IN / TAKEAWAY & EXPRESS DELIVERY */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderTop: 'var(--border-red)'
            }}
          >
            <div
              style={{
                padding: '1.2rem',
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                color: 'var(--red)',
                borderRight: 'var(--border-red)',
                textTransform: 'uppercase'
              }}
            >
              DINE IN & RESTAURANTS
            </div>
            <div
              style={{
                padding: '1.2rem',
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                color: 'var(--red)',
                textTransform: 'uppercase'
              }}
            >
              TAKEAWAY &amp; EXPRESS DELIVERY
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
