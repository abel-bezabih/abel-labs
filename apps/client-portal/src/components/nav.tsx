'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Briefcase, DollarSign, Users, Mail, LogIn, LogOut } from 'lucide-react';
import { Logo } from './logo';
import { isAuthenticated, logout } from '@/lib/auth';
import { useState, useEffect } from 'react';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    router.push('/');
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/services', label: 'Services', icon: Briefcase },
    { href: '/pricing', label: 'Pricing', icon: DollarSign },
    { href: '/about', label: 'About', icon: Users },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    className={`relative px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-blue-50 rounded-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <div className="relative flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}

            {/* Auth Buttons */}
            <div className="ml-4 flex items-center gap-2 border-l border-gray-200 pl-4">
              {authenticated ? (
                <>
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Dashboard
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </>
              ) : (
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </motion.button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

