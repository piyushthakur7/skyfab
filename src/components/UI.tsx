import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useInView } from 'motion/react';

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

export function useCounter(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => { const t = setTimeout(onComplete, 2800); return () => clearTimeout(t); }, [onComplete]);
  return (
    <motion.div className="preloader" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      <div className="preloader-logo flex flex-col items-center">
        <span className="text-4xl font-serif font-bold tracking-wider text-paper">SKYFAB</span>
        <span className="text-[9px] tracking-[0.5em] text-paper/40 font-sans mt-2 uppercase">Overseas Worldwide</span>
      </div>
      <div className="preloader-bar"><div className="preloader-bar-fill" /></div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
        className="text-paper/30 text-[10px] uppercase tracking-[0.4em] font-sans">
        Indian Wear • Export Fabrics • Export Garments
      </motion.p>
    </motion.div>
  );
};
