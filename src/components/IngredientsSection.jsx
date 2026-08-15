import { useState } from 'react';

const INGREDIENTS_LIST = [
  { name: 'KASHMIRI RED CHILLI', emoji: '🌶️', desc: 'Mild heat with vivid natural red color, sun-dried in Kashmir valleys.' },
  { name: 'ORGANIC A2 GHEE', emoji: '🧈', desc: 'Slow-churned pure cow ghee from free-range Gir cows for unmatched aroma.' },
  { name: 'FRESH MALAI PANEER', emoji: '🧀', desc: 'Crafted daily by hand using fresh whole milk and natural lemon curd.' },
  { name: 'KERALA BLACK PEPPER', emoji: '🫘', desc: 'Hand-picked Tellicherry extra-bold peppercorns roasted in iron kadai.' },
  { name: 'WHOLE GREEN CARDAMOM', emoji: '🌱', desc: 'Aromatic pod spices sourced directly from Idukki spice plantations.' }
];

export default function IngredientsSection() {
  const [selectedIngredient, setSelectedIngredient] = useState(INGREDIENTS_LIST[0]);

  return (
    <section
      id="ingredients"
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
            // SPICE PHILOSOPHY
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 7rem)', color: 'var(--black)', margin: '0.5rem 0' }}>
            GOOD FOOD STARTS HERE.
          </h2>
          <p style={{ fontSize: '1.2rem', fontWeight: 500, maxWidth: '540px', margin: '0 auto' }}>
            Hover or tap any ingredient to reveal its origin and culinary purpose.
          </p>
        </div>

        {/* Ingredients Interactive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem', alignItems: 'center' }}>
          
          {/* Left Column: Ingredients Buttons List */}
          <div style={{ gridColumn: 'span 6' }} className="ingr-col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {INGREDIENTS_LIST.map((ingr, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIngredient(ingr)}
                  onMouseEnter={() => setSelectedIngredient(ingr)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.2rem 1.5rem',
                    backgroundColor: selectedIngredient.name === ingr.name ? 'var(--red)' : 'var(--white)',
                    color: selectedIngredient.name === ingr.name ? 'var(--white)' : 'var(--black)',
                    border: 'var(--border-thick)',
                    boxShadow: selectedIngredient.name === ingr.name ? '6px 6px 0px var(--black)' : '3px 3px 0px var(--black)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span>{ingr.emoji}</span>
                    <span>{ingr.name}</span>
                  </span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Ingredient Inspection Card */}
          <div style={{ gridColumn: 'span 6' }} className="ingr-col">
            <div
              style={{
                border: 'var(--border-thick)',
                backgroundColor: 'var(--blue)',
                color: 'var(--cream)',
                padding: '2.5rem',
                boxShadow: '12px 12px 0px var(--black)',
                position: 'relative'
              }}
            >
              <div style={{ border: 'var(--border-thick)', overflow: 'hidden', height: '240px', marginBottom: '2rem', backgroundColor: 'var(--white)' }}>
                <img
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh Organic Indian Spices"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--black)',
                  border: 'var(--border-thick)',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>{selectedIngredient.emoji}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--red)' }}>
                    {selectedIngredient.name}
                  </h3>
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.5 }}>
                  {selectedIngredient.desc}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .ingr-col {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </section>
  );
}
