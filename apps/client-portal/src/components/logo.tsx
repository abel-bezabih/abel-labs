'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'footer' | 'hero';
  showTagline?: boolean;
}

export function Logo({ variant = 'default', showTagline = false }: LogoProps) {
  const isFooter = variant === 'footer';
  const isHero = variant === 'hero';

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${isHero ? 'w-10 h-10' : 'w-8 h-8'} flex items-center justify-center`}
      >
        <Code className={`${isHero ? 'w-10 h-10' : 'w-8 h-8'} ${isFooter ? 'text-white' : 'text-blue-600'} group-hover:text-purple-600 transition-colors`} />
      </motion.div>
      <div className="flex flex-col">
        <div className={`flex items-center gap-1 ${isHero ? 'text-2xl' : 'text-xl'}`}>
          <span className={`font-bold ${isFooter ? 'text-white' : 'animate-gradient-text'}`}>
            Abel
          </span>
          <span className={`font-bold ${isFooter ? 'bg-white/20 text-white border border-white/30' : 'bg-blue-100 border border-blue-200 animate-gradient-text'} px-2 py-0.5 rounded-md`}>
            Labs
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-gray-500">Software Development</span>
        )}
      </div>
    </Link>
  );
}
