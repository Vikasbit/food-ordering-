import FoodProductCard from './FoodProductCard';

const NEW_ARRIVALS = [
  {
    id: 'na-1',
    name: 'Spicy Crispy Chicken Burger',
    description: 'Crispy fried patty, aged cheddar, spicy peri-peri sauce',
    price: 249,
    rating: '4.7',
    review_count: 84,
    prep_time: '12-15 min',
    badge: 'NEW',
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'na-2',
    name: 'Pepperoni Supreme Pizza',
    description: 'Loaded spicy slices, melted mozzarella, fresh basil',
    price: 449,
    rating: '4.8',
    review_count: 104,
    prep_time: '18-22 min',
    badge: 'NEW',
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'na-3',
    name: 'Crispy Wing Box',
    description: '8pc spicy tandoori glazed wings, mint dip',
    price: 279,
    rating: '4.6',
    review_count: 312,
    prep_time: '15-18 min',
    badge: 'NEW',
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'na-4',
    name: 'Cold Brew Cooler',
    description: 'South Indian iced cold brew, sweet vanilla cream float',
    price: 209,
    rating: '4.9',
    review_count: 45,
    prep_time: '5-8 min',
    badge: 'NEW',
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80'
  }
];

export default function NewArrivalsSection({ onAddToCart, onOpenCustomize }) {
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
              New Arrivals
            </h2>
            <p style={{ color: '#78716C', fontSize: '0.92rem', margin: 0 }}>
              Fresh off the grill this week
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
          {NEW_ARRIVALS.map((item) => (
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
