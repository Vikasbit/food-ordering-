import { useState } from 'react';

export default function Hero({ onOpenCart, onOpenOrderTracking }) {
  return (
    <section
      id="hero"
      style={{
        paddingTop: '6.5rem',
        paddingBottom: '3.5rem',
        backgroundColor: 'var(--bg-main)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        className="container-clean"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          alignItems: 'center',
          gap: '3rem',
          minHeight: '480px'
        }}
      >
        {/* LEFT COLUMN: Editorial Headline & Social Proof */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 2 }}>
          
          {/* Tag / Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px'
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>✨</span>
              <span>Delivering happiness daily</span>
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.8rem, 5.2vw, 4.2rem)',
              lineHeight: 1.08,
              fontFamily: 'var(--font-serif)',
              color: 'var(--brand-dark)',
              fontWeight: 700,
              letterSpacing: '-0.025em'
            }}
          >
            Cravings,
            <br />
            <span
              style={{
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
                color: 'var(--brand-primary)',
                fontWeight: 600
              }}
            >
              delivered fast.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.1rem',
              color: '#57534E',
              lineHeight: 1.6,
              maxWidth: '480px',
              fontWeight: 400
            }}
          >
            Discover great restaurants, order your favourites, and track every delivery from one place.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <a
              href="#restaurants"
              className="btn-primary"
              style={{
                padding: '0.85rem 2.2rem',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Order Now
            </a>

            <a
              href="#restaurants"
              className="btn-outline"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Explore Restaurants
            </a>
          </div>

          {/* Real Platform Highlights (No fake stats) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #EFEAE2',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📍</span>
              <span style={{ fontSize: '0.85rem', color: '#57534E', fontWeight: 600 }}>Local Area Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              <span style={{ fontSize: '0.85rem', color: '#57534E', fontWeight: 600 }}>Real-Time Tracking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🛡️</span>
              <span style={{ fontSize: '0.85rem', color: '#57534E', fontWeight: 600 }}>Secure Online Pay</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cheerful Delivery Rider on Yellow Vespa */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Subtle Ambient Background Halo */}
          <div
            style={{
              position: 'absolute',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              backgroundColor: '#FEF08A',
              opacity: 0.35,
              filter: 'blur(70px)',
              zIndex: 1
            }}
          />

          {/* Delivery Rider Graphic */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              maxWidth: '520px',
              animation: 'floatSlow 4s ease-in-out infinite'
            }}
          >
            <img
              src="/assets/hero_scooter_rider.jpg"
              alt="BIGBITES Express Food Delivery"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '28px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.08))'
              }}
            />

            {/* Floating Live Badge: 28 min delivery */}
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                left: '-12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '9999px',
                padding: '0.6rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 8px 24px rgba(28,25,23,0.1)',
                border: '1px solid #ECE7DF',
                animation: 'floatSlow 5s ease-in-out infinite reverse'
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF7ED',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
              >
                ⚡
              </span>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-dark)' }}>
                  Lightning Fast
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#78716C' }}>
                  Avg. 25-30 mins
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (max-width: 960px) {
          #hero .container-clean {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            text-align: center;
          }
          #hero div[style*="flexDirection: 'column'"] {
            align-items: center;
          }
          #hero div[style*="display: 'flex'"][style*="gap: '1rem'"] {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
