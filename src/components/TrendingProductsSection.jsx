import FoodProductCard from './FoodProductCard';

const TRENDING_PRODUCTS = [
  {
    id: 'tp-1',
    name: 'Spicy Chicken Sandwich',
    description: 'Crispy fillet, spicy mayo, pickled slaw',
    price: 249,
    rating: '4.7',
    review_count: 132,
    prep_time: '14-18 min',
    badge: 'TRENDING',
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'tp-2',
    name: 'Chicken Fry Bucket',
    description: 'Crispy marinated drumsticks, mint garlic chutney',
    price: 349,
    rating: '4.8',
    review_count: 211,
    prep_time: '14-18 min',
    badge: '',
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'tp-3',
    name: 'Garlic Bread Sticks',
    description: 'Toasted herbs, garlic butter, spiced herbs',
    price: 209,
    rating: '4.5',
    review_count: 74,
    prep_time: '8-12 min',
    badge: '',
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'tp-4',
    name: 'Mango Lassi',
    description: 'Fresh Alphonso mango, creamy thick yogurt, cardamom',
    price: 209,
    rating: '4.8',
    review_count: 95,
    prep_time: '5-8 min',
    badge: 'TRENDING',
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80'
  }
];

export default function TrendingProductsSection({ onAddToCart, onOpenCustomize }) {
  return (
    <section style={{ padding: '2rem 0 3.5rem', backgroundColor: 'var(--bg-main)' }}>
      <div className="container-clean">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 2.8vw, 2.2rem)',
                fontFamily: 'var(--font-serif)',
                color: 'var(--brand-dark)',
                marginBottom: '0.25rem',
                fontWeight: 600
              }}
            >
              Trending Products
            </h2>
            <p style={{ color: '#78716C', fontSize: '0.92rem', margin: 0 }}>
              What everyone's ordering right now
            </p>
          </div>

          <a href="#menu" className="btn-see-all">
            See All
          </a>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
            gap: '1.5rem'
          }}
        >
          {TRENDING_PRODUCTS.map((item) => (
            <FoodProductCard
              key={item.id}
              product={item}
              onAddToCart={onAddToCart}
              onOpenCustomize={onOpenCustomize}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
