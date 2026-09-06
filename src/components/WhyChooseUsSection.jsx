const FEATURES = [
  {
    id: 'local',
    icon: '🍽️',
    title: 'Verified Local Kitchens',
    description: 'Authentic meals from trusted local eateries and cloud kitchens'
  },
  {
    id: 'tracking',
    icon: '📍',
    title: 'Live Order Tracking',
    description: 'Track your order status and rider location in real time'
  },
  {
    id: 'secure',
    icon: '🛡️',
    title: 'Secure Online Payments',
    description: 'Seamless & safe transactions via Razorpay UPI, Cards & Netbanking'
  },
  {
    id: 'fresh',
    icon: '🛵',
    title: 'Fresh & Hot Delivery',
    description: 'Direct kitchen-to-doorstep dispatch with thermal insulation'
  }
];

export default function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-main)' }}>
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
            The BIGBITES Advantage
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
            Why Order on BIGBITES
          </h2>
          <p style={{ color: '#78716C', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
            A fast, honest, and reliable local food ordering experience
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {FEATURES.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '1.5rem 1.25rem',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '1rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #ECE7DF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
              }}
            >
              {/* Icon Circle */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FFF7ED',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                  border: '1px solid #FED7AA'
                }}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--brand-dark)',
                    margin: '0 0 0.25rem'
                  }}
                >
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#78716C', margin: 0, lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
