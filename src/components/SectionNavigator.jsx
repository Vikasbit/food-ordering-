import { useState, useEffect, useCallback } from 'react';
import { SECTIONS } from '../data/sections';
import './SectionNavigator.css';

export default function SectionNavigator({ scrollContainerRef, progressRef }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let raf;
    const update = () => {
      const p = progressRef.current;
      let idx = 0;
      for (let i = 0; i < SECTIONS.length; i++) {
        if (p >= SECTIONS[i].start) idx = i;
      }
      setActiveIndex(idx);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  const handleClick = useCallback((section) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const target = section.start * maxScroll;
    container.scrollTo({ top: target, behavior: 'smooth' });
  }, [scrollContainerRef]);

  return (
    <nav className="section-nav">
      <ul>
        {SECTIONS.map((section, i) => (
          <li key={section.id}>
            <button
              className={`section-nav-item ${i === activeIndex ? 'active' : ''}`}
              onClick={() => handleClick(section)}
            >
              <span className="section-nav-label">{section.label}</span>
              <span className="section-nav-line">
                {i === activeIndex && (
                  <svg width="40" height="10" viewBox="0 0 40 10" fill="none">
                    <path
                      d="M0 5 Q 5 0, 10 5 T 20 5 T 30 5 T 40 5"
                      stroke="#FF7438"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

