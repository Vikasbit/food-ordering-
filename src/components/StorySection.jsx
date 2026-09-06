export default function StorySection() {
  return (
    <section
      id="our-story"
      style={{
        backgroundColor: 'var(--cream)',
        borderBottom: 'var(--border-thick)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr 220px',
          minHeight: '650px'
        }}
        className="story-grid-container"
      >
        {/* LEFT COLUMN: Vertical Calligraphy Script */}
        <div
          className="border-r"
          style={{
            backgroundColor: '#F9F4E8',
            color: 'var(--red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 0',
            position: 'relative'
          }}
        >
          <span
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontFamily: 'var(--font-display)',
              fontSize: '4.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--red)',
              lineHeight: 1
            }}
          >
            BigBites
          </span>
        </div>

        {/* CENTER COLUMN: Authentic Indian Chef Photo */}
        <div
          style={{
            position: 'relative',
            backgroundColor: 'var(--yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <img
            src="/assets/indian-master-chef.png"
            alt="Indian Master Chef Preparing Authentic Food in Indian Cooking Style"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '2rem',
              backgroundColor: 'var(--red)',
              color: 'var(--white)',
              padding: '0.8rem 1.6rem',
              fontFamily: 'var(--font-display)',
              border: 'var(--border-thick)',
              fontSize: '1.2rem'
            }}
          >
            INDIAN KITCHEN &amp; TANDOOR LAB • MUMBAI &amp; DELHI
          </div>
        </div>

        {/* RIGHT COLUMN: Red Background with Hindi Calligraphy */}
        <div
          style={{
            backgroundColor: 'var(--red)',
            color: 'var(--cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <span
            style={{
              writingMode: 'vertical-rl',
              fontFamily: 'var(--font-body)',
              fontWeight: 900,
              fontSize: '5rem',
              letterSpacing: '0.02em',
              color: 'var(--cream)',
              textTransform: 'uppercase',
              lineHeight: 1,
              userSelect: 'none'
            }}
          >
            स्वादिष्ट
          </span>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .story-grid-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
