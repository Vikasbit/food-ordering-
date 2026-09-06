import ImageWithFallback from './ImageWithFallback';

const CATEGORIES = [
  {
    id: 'burgers',
    name: 'Burgers',
    tagline: 'Juicy & Grilled',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'pizza',
    name: 'Pizza',
    tagline: 'Wood-fired Slices',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'indian',
    name: 'Indian',
    tagline: 'Curries & Biryanis',
    img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'chinese',
    name: 'Chinese',
    tagline: 'Noodles & Dimsums',
    img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'chicken',
    name: 'Chicken',
    tagline: 'Crispy & Tandoori',
    img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'healthy',
    name: 'Healthy',
    tagline: 'Salads & Bowls',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'desserts',
    name: 'Desserts',
    tagline: 'Sweet Indulgence',
    img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'drinks',
    name: 'Drinks',
    tagline: 'Shakes & Coolers',
    img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'sides',
    name: 'Sides',
    tagline: 'Fries & Dips',
    img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=300&auto=format&fit=crop&q=80'
  }
];

export default function FeaturedCategoriesSection({ onSelectCategory, activeCategory }) {
  return (
    <section
      id="categories"
      style={{
        padding: '3.5rem 0 3rem',
        backgroundColor: 'var(--bg-main)'
      }}
    >
      <div className="container-clean">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--brand-primary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block',
              marginBottom: '0.4rem'
            }}
          >
            What are you craving?
          </span>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.2vw, 2.5rem)',
              fontFamily: 'var(--font-serif)',
              color: 'var(--brand-dark)',
              margin: '0 0 0.4rem',
              fontWeight: 700
            }}
          >
            Popular Food Categories
          </h2>
          <p style={{ color: '#78716C', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
            Explore curated dishes from top-rated kitchens in your neighbourhood
          </p>
        </div>

        {/* 9 Category Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1.2rem'
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.name.toLowerCase() || activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                className="category-card"
                style={{
                  backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                  borderColor: isSelected ? 'var(--brand-primary)' : '#ECE7DF',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: '16px',
                  padding: '1.25rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: isSelected ? '0 8px 20px rgba(234, 88, 12, 0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isSelected ? '0 8px 20px rgba(234, 88, 12, 0.12)' : '0 2px 8px rgba(0,0,0,0.02)';
                }}
              >
                {/* Food Image / Thumbnail */}
                <div
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    backgroundColor: '#FAF5EE',
                    marginBottom: '0.85rem',
                    overflow: 'hidden',
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
                  }}
                >
                  <ImageWithFallback
                    src={cat.img}
                    alt={cat.name}
                    fallbackType="food"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--brand-dark)',
                    margin: '0 0 0.15rem'
                  }}
                >
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.72rem', color: '#78716C', margin: 0, fontWeight: 500 }}>
                  {cat.tagline}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
