import FoodProductCard from './FoodProductCard';

const BEST_SELLERS = [
  {
    id: 'bs-1',
    name: 'Double Smash Cheeseburger',
    description: 'Aged cheddar, caramelized onions, toasted brioche bun',
    price: 299,
    rating: '4.9',
    review_count: 420,
    prep_time: '12-15 min',
    badge: 'BESTSELLER',
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bs-2',
    name: 'Classic Margherita Supreme',
    description: 'San Marzano tomatoes, fresh mozzarella, sweet basil',
    price: 299,
    rating: '4.8',
    review_count: 210,
    prep_time: '15-20 min',
    badge: 'BESTSELLER',
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bs-3',
    name: 'Golden Peri-Peri Fries',
    description: 'Crispy skin-on fries tossed in peri-peri masala',
    price: 209,
    rating: '4.9',
    review_count: 530,
    prep_time: '8-10 min',
    badge: 'BESTSELLER',
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bs-4',
    name: 'Chocolate Fudge Shake',
    description: 'Rich Belgian cocoa, whipped cream, chocolate shavings',
    price: 219,
    rating: '4.9',
    review_count: 180,
    prep_time: '5-8 min',
    badge: 'BESTSELLER',
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80'
  }
];

export default function BestSellersSection({ onAddToCart, onOpenCustomize }) {
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
              Best Sellers
            </h2>
            <p style={{ color: '#78716C', fontSize: '0.92rem', margin: 0 }}>
              Loved by thousands of Customers
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {BEST_SELLERS.map((item) => (
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
