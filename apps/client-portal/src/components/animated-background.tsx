'use client';

import { motion } from 'framer-motion';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30" />
      
      {/* Animated mesh gradient blobs */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/40 via-purple-400/30 to-pink-400/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-400/35 via-blue-400/25 to-indigo-400/20 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400/30 via-pink-400/25 to-rose-400/20 blur-3xl"
        animate={{
          x: [0, 120, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-400/25 via-purple-400/20 to-blue-400/15 blur-3xl"
        animate={{
          x: [0, -60, 0],
          y: [0, -80, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />
      
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-blue-100/20" />
    </div>
  );
}












