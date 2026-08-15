import { motion } from 'framer-motion';

export default function CommunitySection() {
  const REVIEWS = [
    { quote: "Finally an Indian brand in Europe that doesn't dilute the spices! The Butter Chicken is unmatched.", author: "ARIANE B.", role: "PARIS FOOD CRITIC", color: 'var(--yellow)', text: 'var(--black)' },
    { quote: "The zero-waste bio packaging and overnight oat lassi combo is my daily workout fuel.", author: "MARCUS K.", role: "ATHLETE & ARCHITECT", color: 'var(--red)', text: 'var(--white)' },
    { quote: "Tastes exactly like Chandni Chowk in Delhi. Uncompromised authentic flavors delivered hot.", author: "PRIYA S.", role: "DESIGN DIRECTOR", color: 'var(--blue)', text: 'var(--cream)' }
  ];

  return (
    <section
      style={{
        backgroundColor: 'var(--cream)',
        padding: '6rem 0',
        borderBottom: 'var(--border-thick)',
        position: 'relative'
      }}
    >
      <div className="container-editorial">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--red)', fontSize: '1rem', letterSpacing: '0.1em' }}>
            // COMMUNITY VOICES
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 7rem)', color: 'var(--black)', margin: '0.5rem 0' }}>
            FOOD BRINGS<br />PEOPLE TOGETHER.
          </h2>
        </div>

        {/* 3 Review Color Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }} className="reviews-grid">
          {REVIEWS.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              style={{
                border: 'var(--border-thick)',
                backgroundColor: rev.color,
                color: rev.text,
                padding: '2.5rem 2rem',
                boxShadow: '8px 8px 0px var(--black)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>“</div>
              <p style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '2rem' }}>
                {rev.quote}
              </p>
              <div style={{ borderTop: '2px solid currentColor', paddingTop: '1rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{rev.author}</h4>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>{rev.role}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .reviews-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

