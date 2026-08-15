import { motion } from 'framer-motion';

export default function AaoKhaoSection() {
  return (
    <section
      id="aao-khao"
      style={{
        backgroundColor: 'var(--red)',
        color: 'var(--white)',
        padding: '6rem 1rem',
        borderBottom: 'var(--border-thick)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        textAlign: 'center'
      }}
    >
      {/* Background Decorative Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          userSelect: 'none'
        }}
      >
        {/* Top Word: आओ in White */}
        <motion.h2
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Space Grotesk', 'Archivo Black', system-ui, sans-serif",
            fontSize: 'clamp(5rem, 24vw, 24rem)',
            fontWeight: 900,
            color: 'var(--white)',
            lineHeight: 0.8,
            letterSpacing: '-0.02em',
            margin: 0,
            textShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }}
        >
          आओ
        </motion.h2>

        {/* Bottom Word: खाओ in Warm Cream */}
        <motion.h2
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Space Grotesk', 'Archivo Black', system-ui, sans-serif",
            fontSize: 'clamp(5rem, 24vw, 24rem)',
            fontWeight: 900,
            color: 'var(--cream)',
            lineHeight: 0.8,
            letterSpacing: '-0.02em',
            margin: 0,
            textShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }}
        >
          खाओ
        </motion.h2>
      </div>

      {/* Floating Interactive Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          marginTop: '3rem',
          position: 'relative',
          zIndex: 3
        }}
      >
        <a
          href="#menu"
          className="btn-editorial"
          style={{
            backgroundColor: 'var(--yellow)',
            color: 'var(--black)',
            fontSize: '1.2rem',
            padding: '1rem 2.5rem',
            border: 'var(--border-thick)',
            boxShadow: '6px 6px 0px var(--black)'
          }}
          data-cursor="COME & EAT"
        >
          ORDER FRESH FOOD NOW →
        </a>
      </motion.div>
    </section>
  );
}
