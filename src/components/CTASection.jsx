import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section
      style={{
        backgroundColor: 'var(--cream)',
        padding: '8rem 0',
        borderBottom: 'var(--border-thick)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container-editorial">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontFamily: 'var(--font-display)', color: 'var(--red)', fontSize: '1.2rem', letterSpacing: '0.1em' }}
        >
          // SATISFY YOUR CRAVINGS NOW
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.5rem, 12vw, 13rem)',
            color: 'var(--red)',
            lineHeight: 0.85,
            margin: '1.5rem 0 3rem 0',
            textTransform: 'uppercase'
          }}
        >
          READY<br />TO EAT?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a href="#menu" className="btn-editorial" style={{ fontSize: '1.3rem', padding: '1.2rem 3rem' }} data-cursor="ORDER NOW">
            ORDER NOW →
          </a>
          <a href="#locations" className="btn-editorial-outline" style={{ fontSize: '1.3rem', padding: '1.2rem 3rem' }} data-cursor="LOCATIONS">
            FIND A KITCHEN
          </a>
        </motion.div>
      </div>
    </section>
  );
}

