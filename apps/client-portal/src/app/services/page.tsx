'use client';

import { motion } from 'framer-motion';
import {
  Globe,
  Smartphone,
  ShoppingCart,
  Zap,
  Code,
  Database,
  Cloud,
  Shield,
  BarChart3,
  Palette,
  Search,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { Magnetic } from '../../components/magnetic';

// Animation variant removed - not currently used in this component

export default function ServicesPage() {
  const services = [
    {
      icon: Globe,
      title: 'Web Development',
      description: 'Modern, responsive websites built with Next.js, React, and cutting-edge technologies.',
      features: [
        'Custom website design',
        'E-commerce solutions',
        'Content management systems',
        'Progressive web apps',
        'SEO optimization',
        'Performance optimization',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Smartphone,
      title: 'Mobile App Development',
      description: 'Native and cross-platform mobile apps for iOS and Android using React Native.',
      features: [
        'iOS & Android apps',
        'Cross-platform development',
        'App store optimization',
        'Push notifications',
        'Offline functionality',
        'Real-time sync',
      ],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: ShoppingCart,
      title: 'E-commerce Solutions',
      description: 'Complete online stores with payment integration, inventory management, and more.',
      features: [
        'Product catalog',
        'Shopping cart',
        'Payment gateways (Chapa/Telebirr/Stripe)',
        'Order management',
        'Inventory tracking',
        'Admin dashboard',
      ],
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Code,
      title: 'Custom Software',
      description: 'Bespoke software solutions tailored to your unique business needs.',
      features: [
        'Custom APIs',
        'Backend development',
        'Database design',
        'System integration',
        'Legacy modernization',
        'Scalable architecture',
      ],
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Database,
      title: 'Database Solutions',
      description: 'Robust database design and management for your applications.',
      features: [
        'Database design',
        'Data migration',
        'Performance optimization',
        'Backup & recovery',
        'Data analytics',
        'Cloud databases',
      ],
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Cloud,
      title: 'Cloud Infrastructure',
      description: 'Deploy and scale your applications on AWS, Azure, or Google Cloud.',
      features: [
        'Cloud deployment',
        'Server setup',
        'CI/CD pipelines',
        'Auto-scaling',
        'Monitoring & logging',
        'Security hardening',
      ],
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Keep your applications secure with best-in-class security practices.',
      features: [
        'Security audits',
        'SSL certificates',
        'Data encryption',
        'GDPR compliance',
        'Penetration testing',
        'Security monitoring',
      ],
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Make data-driven decisions with comprehensive analytics and reporting.',
      features: [
        'Google Analytics setup',
        'Custom dashboards',
        'Business intelligence',
        'Data visualization',
        'Performance metrics',
        'User behavior tracking',
      ],
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Palette,
      title: 'UI/UX Design',
      description: 'Beautiful, intuitive interfaces that users love.',
      features: [
        'User research',
        'Wireframing',
        'Prototyping',
        'Visual design',
        'Design systems',
        'Usability testing',
      ],
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Search,
      title: 'SEO & Marketing',
      description: 'Get found online with strategic SEO and digital marketing.',
      features: [
        'SEO optimization',
        'Content strategy',
        'Link building',
        'Local SEO',
        'Social media integration',
        'Conversion optimization',
      ],
      color: 'from-teal-500 to-green-500',
    },
    {
      icon: Mail,
      title: 'Email & Automation',
      description: 'Automate your marketing and communication workflows.',
      features: [
        'Email campaigns',
        'Marketing automation',
        'Newsletter setup',
        'CRM integration',
        'Lead nurturing',
        'Analytics tracking',
      ],
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Zap,
      title: 'Maintenance & Support',
      description: 'Ongoing support to keep your applications running smoothly.',
      features: [
        'Bug fixes',
        'Feature updates',
        'Performance monitoring',
        'Security patches',
        '24/7 support',
        'Regular backups',
      ],
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative py-24 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-slate-900/[0.04]" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            From websites to mobile apps, we offer a complete suite of digital solutions to help your business thrive online.
          </motion.p>
        </div>
      </motion.section>

      {/* Services Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 px-4"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all flex flex-col"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>
                  <div className="space-y-2 mb-4">
                    {service.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {feature}
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{service.features.length - 3} more features
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Magnetic>
                      <Link
                        href="/pricing"
                        className="block text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        View Pricing
                      </Link>
                    </Magnetic>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 px-4"
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl"
          >
            <h2 className="text-4xl font-bold mb-4">Need Something Custom?</h2>
            <p className="text-xl mb-8 text-white/90">
              We're here to build exactly what your business needs
            </p>
            <Magnetic>
              <motion.a
                href="/pricing"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Get a Custom Quote
              </motion.a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}


