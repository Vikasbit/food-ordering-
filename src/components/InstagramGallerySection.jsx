import ImageWithFallback from './ImageWithFallback';

const INSTA_IMAGES = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80',
    alt: 'Freshly baked brioche buns'
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80',
    alt: 'Chef assembling fresh gourmet burgers'
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
    alt: 'Sizzling hot grill and tandoor station'
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=80',
    alt: 'Wood-fired gourmet pizza'
  },
  {
    id: 5,
    img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&auto=format&fit=crop&q=80',
    alt: 'Golden crispy chicken wings'
  },
  {
    id: 6,
    img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop&q=80',
    alt: 'House-crafted signature artisanal desserts'
  }
];

export default function InstagramGallerySection() {
  return (
    <section style={{ padding: '3.5rem 0 4rem', backgroundColor: 'var(--bg-main)' }}>
      <div className="container-clean">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Follow The Food Trail
            </span>
          </div>
          <h3
            style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-serif)',
              color: 'var(--brand-dark)',
              margin: '0 0 0.4rem'
            }}
          >
            @bigbites.food
          </h3>
          <p style={{ color: '#78716C', fontSize: '0.92rem', margin: 0 }}>
            Tag us in your food stories to be featured on our community feed
          </p>
        </div>

        {/* 6 Square Photos Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1rem',
            borderRadius: '20px'
          }}
        >
          {INSTA_IMAGES.map((item) => (
            <div
              key={item.id}
              style={{
                position: 'relative',
                aspectRatio: '1/1',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#F5F0E8',
                border: '1px solid #ECE7DF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                cursor: 'pointer'
              }}
            >
              <ImageWithFallback
                src={item.img}
                alt={item.alt}
                fallbackType="food"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section div[style*="gridTemplateColumns: 'repeat(6, 1fr)'"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 500px) {
          section div[style*="gridTemplateColumns: 'repeat(6, 1fr)'"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
