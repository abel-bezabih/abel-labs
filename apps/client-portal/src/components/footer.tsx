'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Logo } from './logo';

export function Footer() {
  const footerLinks = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Contact', href: '/contact' },
    ],
    resources: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/portfolio' },
      { label: 'Support', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo variant="footer" showTagline={false} />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Building the future of digital Canada. We create world-class websites, mobile apps, and custom software solutions.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@abellabs.ca" className="hover:text-white transition-colors">
                  hello@abellabs.ca
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+16049776878" className="hover:text-white transition-colors">
                  (604) 977-6878
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Burnaby, BC, Canada</span>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              );
            })}
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Abel Labs. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}


