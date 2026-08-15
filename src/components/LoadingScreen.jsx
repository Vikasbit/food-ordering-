import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.css';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setVisible(false);
            onComplete?.();
          }, 400);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loading-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="loading-content">
            <div className="loading-logo">
              <span className="loading-logo-eat">EAT</span>naked
            </div>
            <div className="loading-bar-track">
              <motion.div
                className="loading-bar-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="loading-text">Preparing your experience...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
