import { motion } from 'framer-motion';
import { SIGNATURE_DISHES } from '../data/menu';

export default function DishesSection({ onSelectDish, onAddToCart, onCustomizeDish, onOpenRestaurantPage }) {
  return (
    <section
      id="our-food"
      style={{
        backgroundColor: '#F9F4E8',
        padding: '5rem 0',
        borderBottom: 'var(--border-thick)'
      }}
    >
      <div className="container-editorial">
        {/* Marketplace Restaurant Discovery Banner */}
        <div
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--yellow)',
            border: 'var(--border-thick)',
            boxShadow: '6px 6px 0px var(--red)',
            padding: '1.2rem 1.8rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--red)', display: 'block', textTransform: 'uppercase' }}>
              TWO-SIDED MARKETPLACE KITCHENS & SELLER STORES
            </span>
            <h3 style={{ margin: '0.2rem 0 0', fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)' }}>
              EXPLORE NEARBY BIGBITES RESTAURANT PARTNERS & MENUS
            </h3>
          </div>
          <button
            onClick={() => onOpenRestaurantPage && onOpenRestaurantPage({
              id: 'rest-delhi-cp',
              name: 'BigBites — Connaught Place',
              cuisine: 'North Indian · Tandoor · Thalis',
              address: 'Block A, Inner Circle, Connaught Place, New Delhi 110001',
              rating: 4.8,
              reviews_count: 1420,
              categories: [
                {
                  id: 'cat-curries',
                  name: 'SIGNATURE CURRIES',
                  items: [
                    { id: 'item-butter-chicken', name: 'BUTTER CHICKEN SPECIAL', description: 'Tender tandoori chicken simmered in butter gravy.', price: 340, image_url: '/assets/butter-chicken-real.png', is_veg: false, is_bestseller: true },
                    { id: 'item-palak-paneer', name: 'SHAHI PALAK PANEER', description: 'Cottage cheese in garlic spinach gravy.', price: 290, image_url: '/assets/palak-paneer-real.png', is_veg: true, is_bestseller: true }
                  ]
                }
              ]
            })}
            className="btn-editorial"
            style={{ backgroundColor: 'var(--yellow)', color: 'var(--black)', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
          >
            🏪 OPEN RESTAURANT STORE PAGE →
          </button>
        </div>
        
        {/* 3-Column Editorial Dish Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}
          className="dishes-grid"
        >
          
          {/* PANEL 1: YELLOW - PALAK PANEER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              backgroundColor: 'var(--yellow)',
              border: 'var(--border-thick)',
              padding: '2rem 1.8rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '620px',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.8rem', color: 'var(--white)', fontWeight: 900, fontFamily: 'var(--font-body)' }}>
                  {SIGNATURE_DISHES[0].hindiName}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--white)' }}>✹</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--white)', marginTop: '0.2rem', lineHeight: 0.9 }}>
                PALAK<br />PANEER
              </h3>
            </div>

            <div
              onClick={() => onSelectDish(SIGNATURE_DISHES[0])}
              style={{
                backgroundColor: 'var(--blue)',
                padding: '2rem 1rem',
                margin: '1.5rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '240px',
                cursor: 'pointer'
              }}
              data-cursor="INSPECT"
            >
              <img
                src={SIGNATURE_DISHES[0].image}
                alt="Palak Paneer Metal Plate"
                style={{
                  width: '100%',
                  height: '190px',
                  objectFit: 'cover',
                  borderRadius: '50% / 30%',
                  border: '3px solid var(--white)'
                }}
              />
            </div>

            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--white)', lineHeight: 1.3, textTransform: 'uppercase', marginBottom: '1rem' }}>
              {SIGNATURE_DISHES[0].description}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onAddToCart(SIGNATURE_DISHES[0])}
                className="btn-editorial"
                style={{ flex: 1, backgroundColor: 'var(--black)', color: 'var(--cream)', fontSize: '0.8rem', padding: '0.6rem 0.4rem' }}
              >
                ADD ({SIGNATURE_DISHES[0].price}) +
              </button>
              <button
                onClick={() => onCustomizeDish && onCustomizeDish(SIGNATURE_DISHES[0])}
                className="btn-editorial"
                style={{ backgroundColor: 'var(--white)', color: 'var(--black)', fontSize: '0.8rem', padding: '0.6rem 0.8rem' }}
              >
                CUSTOMIZE ⚙️
              </button>
            </div>
          </motion.div>

          {/* PANEL 2: WHITE - ENGLISH, STATIC INDIAN MONUMENT ILLUSTRATION & HINDI TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              backgroundColor: 'var(--white)',
              border: 'var(--border-thick)',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '620px',
              position: 'relative'
            }}
          >
            {/* Top English Headline */}
            <div>
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--red)', fontSize: '0.85rem', letterSpacing: '0.1em', display: 'block', marginBottom: '1rem' }}>
                // CULINARY MANIFESTO
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  color: 'var(--black)',
                  lineHeight: 1.05,
                  textTransform: 'uppercase'
                }}
              >
                A MENU ROOTED IN INDIAN STREET FOOD, CRAFTED BEYOND THE CLASSICS
              </h3>
            </div>

            {/* CENTER: Static Editorial Indian Monument Vector Graphic */}
            <div
              style={{
                margin: '1.5rem 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxHeight: '130px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg viewBox="0 0 400 160" width="100%" height="130" fill="none">
                  <circle cx="200" cy="90" r="60" fill="rgba(242, 13, 13, 0.08)" />
                  <circle cx="200" cy="90" r="40" fill="rgba(255, 196, 0, 0.15)" />

                  <g fill="var(--red)">
                    <rect x="150" y="120" width="100" height="12" rx="1" />
                    <rect x="160" y="55" width="20" height="65" />
                    <rect x="220" y="55" width="20" height="65" />
                    <path d="M180 75 C180 60 220 60 220 75 L220 120 L180 120 Z" fill="var(--white)" stroke="var(--red)" strokeWidth="3" />
                    <rect x="150" y="45" width="100" height="10" />
                    <rect x="145" y="40" width="110" height="5" />
                    <polygon points="160,40 200,25 240,40" fill="var(--red)" />
                  </g>

                  <g fill="var(--black)" opacity="0.85">
                    <path d="M100 120 L100 85 C100 70 120 70 120 85 L120 120 Z" />
                    <line x1="110" y1="70" x2="110" y2="55" stroke="var(--black)" strokeWidth="2" />
                    <path d="M280 120 L280 85 C280 70 300 70 300 85 L300 120 Z" />
                    <line x1="290" y1="70" x2="290" y2="55" stroke="var(--black)" strokeWidth="2" />
                  </g>

                  <line x1="50" y1="132" x2="350" y2="132" stroke="var(--black)" strokeWidth="3" />
                  <circle cx="200" cy="142" r="3" fill="var(--red)" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  color: 'var(--red)',
                  backgroundColor: 'var(--cream)',
                  padding: '0.2rem 0.6rem',
                  border: 'var(--border-thin)',
                  textTransform: 'uppercase'
                }}
              >
                ★ INDIA GATE • NEW DELHI ★
              </span>
            </div>

            {/* Bottom Hindi Calligraphy */}
            <div style={{ textAlign: 'right', marginTop: 'auto', borderTop: 'var(--border-thick)', paddingTop: '1.2rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--red)', lineHeight: 1.3, fontFamily: 'var(--font-body)' }}>
                भारतीय स्ट्रीट फ़ूड की जड़ों से जुड़ा,<br />
                परंपराओं से परे एक नया अनुभव।
              </p>
            </div>
          </motion.div>

          {/* PANEL 3: GREEN - BUTTER CHICKEN */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              backgroundColor: 'var(--green)',
              border: 'var(--border-thick)',
              padding: '2rem 1.8rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '620px',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.8rem', color: 'var(--white)', fontWeight: 900, fontFamily: 'var(--font-body)' }}>
                  {SIGNATURE_DISHES[1].hindiName}
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--white)' }}>✹</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--white)', marginTop: '0.2rem', lineHeight: 0.9 }}>
                BUTTER<br />CHICKEN
              </h3>
            </div>

            <div
              onClick={() => onSelectDish(SIGNATURE_DISHES[1])}
              style={{
                backgroundColor: 'var(--orange)',
                padding: '2rem 1rem',
                margin: '1.5rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '240px',
                cursor: 'pointer'
              }}
              data-cursor="INSPECT"
            >
              <img
                src={SIGNATURE_DISHES[1].image}
                alt="Butter Chicken Oval Bowl"
                style={{
                  width: '100%',
                  height: '190px',
                  objectFit: 'cover',
                  borderRadius: '50% / 35%',
                  border: '3px solid var(--white)'
                }}
              />
            </div>

            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--white)', lineHeight: 1.3, textTransform: 'uppercase', marginBottom: '1rem' }}>
              {SIGNATURE_DISHES[1].description}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onAddToCart(SIGNATURE_DISHES[1])}
                className="btn-editorial"
                style={{ flex: 1, backgroundColor: 'var(--black)', color: 'var(--cream)', fontSize: '0.8rem', padding: '0.6rem 0.4rem' }}
              >
                ADD ({SIGNATURE_DISHES[1].price}) +
              </button>
              <button
                onClick={() => onCustomizeDish && onCustomizeDish(SIGNATURE_DISHES[1])}
                className="btn-editorial"
                style={{ backgroundColor: 'var(--white)', color: 'var(--black)', fontSize: '0.8rem', padding: '0.6rem 0.8rem' }}
              >
                CUSTOMIZE ⚙️
              </button>
            </div>
          </motion.div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .dishes-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
