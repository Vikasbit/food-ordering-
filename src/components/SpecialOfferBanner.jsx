import ImageWithFallback from './ImageWithFallback';

export default function SpecialOfferBanner({ onOrderNow }) {
  return (
    <section id="offers" style={{ padding: '3rem 0 4rem', backgroundColor: 'var(--bg-main)' }}>
      <div className="container-clean">
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            borderRadius: '24px',
            border: '1px solid #FED7AA',
            padding: '3rem 3.5rem',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            alignItems: 'center',
            gap: '2.5rem',
            boxShadow: '0 8px 30px rgba(234, 88, 12, 0.08)'
          }}
        >
          {/* Subtle warm backdrop blur circle */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: '-30px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              backgroundColor: '#FDBA74',
              opacity: 0.35,
              filter: 'blur(50px)'
            }}
          />

          {/* Left Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <span
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.3rem 0.8rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em'
                }}
              >
                SPECIAL WELCOME OFFER
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
                fontFamily: 'var(--font-serif)',
                color: 'var(--brand-dark)',
                lineHeight: 1.15,
                margin: '0 0 0.8rem',
                fontWeight: 800,
                letterSpacing: '-0.02em'
              }}
            >
              Get 50% OFF with <span style={{ color: 'var(--brand-primary)' }}>EAT50</span>
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#57534E',
                marginBottom: '1.5rem',
                lineHeight: 1.6,
                maxWidth: '460px'
              }}
            >
              Enjoy flat 50% discount on your order across top partner restaurants in your delivery area.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="#restaurants"
                onClick={onOrderNow}
                className="btn-primary"
                style={{
                  padding: '0.85rem 2.2rem',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
              >
                Order Now &amp; Save 50%
              </a>

              {/* Coupon Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px dashed var(--brand-primary)',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: 'var(--brand-primary)',
                  letterSpacing: '0.08em'
                }}
              >
                <span>🏷️ USE CODE:</span>
                <span>EAT50</span>
              </div>
            </div>
          </div>

          {/* Right Content: 50% Off Graphic & Burger */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            {/* 50% Off cursive script overlay */}
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                left: '-16px',
                zIndex: 3,
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: 'clamp(2.6rem, 4.5vw, 3.8rem)',
                color: 'var(--brand-primary)',
                textShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
                transform: 'rotate(-8deg)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              50% OFF
            </div>

            {/* Burger Image with Fallback */}
            <div
              style={{
                width: '100%',
                maxWidth: '340px',
                height: '240px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(28,25,23,0.14)',
                border: '4px solid #FFFFFF',
                transform: 'rotate(2deg)'
              }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80"
                alt="BIGBITES Special Offer Gourmet Meal"
                fallbackType="food"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #offers div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
            padding: 2.2rem 1.5rem !important;
            text-align: center;
          }
          #offers div[style*="justifyContent: 'center'"] {
            margin-top: 1.5rem;
          }
          #offers div[style*="display: 'flex'"][style*="gap: '1rem'"] {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
