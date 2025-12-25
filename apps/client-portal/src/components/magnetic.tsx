'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
}

export function Magnetic({ children, strength = 12 }: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.2 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      x.set((dx / rect.width) * strength);
      y.set((dy / rect.height) * strength);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    node.addEventListener('mousemove', handleMouseMove);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      className="inline-block"
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}















