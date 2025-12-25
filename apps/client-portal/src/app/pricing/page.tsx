'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, Globe, Smartphone, ShoppingCart, Wrench, ArrowRight, Zap } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Landing Page',
      price: '$299 - $599',
      currency: 'CAD',
      description: 'Perfect for small businesses getting started online. Launch in 1-2 weeks!',
      features: [
        'Modern, responsive design',
        'Mobile-friendly',
        'Contact form',
        'Social media integration',
        'Basic SEO setup',
        '1 month free support',
      ],
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      popular: false,
    },
    {
      name: 'Full Website',
      price: '$599 - $1,499',
      currency: 'CAD',
      description: 'Complete website solution for growing businesses. Everything you need to succeed online.',
      features: [
        'Everything in Landing Page',
        '5-10 pages',
        'Blog/CMS integration',
        'Advanced SEO',
        'Analytics setup',
        '3 months free support',
        'Content management system',
      ],
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      popular: true,
    },
    {
      name: 'E-commerce Store',
      price: '$1,799 - $3,500',
      currency: 'CAD',
      description: 'Full online store with payment integration. Start selling online today!',
      features: [
        'Everything in Full Website',
        'Product catalog',
        'Shopping cart',
        'Payment integration (Stripe/Interac)',
        'Inventory management',
        'Order tracking',
        '6 months free support',
      ],
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-500',
      popular: false,
    },
    {
      name: 'Mobile App',
      price: '$3,100 - $7,000',
      currency: 'CAD',
      description: 'Native iOS & Android mobile applications. Reach customers on the go!',
      features: [
        'iOS & Android apps',
        'App Store submission',
        'Push notifications',
        'Offline functionality',
        'Backend API integration',
        '1 year free support',
        '2 major updates included',
      ],
      icon: Smartphone,
      color: 'from-orange-500 to-red-500',
      popular: false,
    },
  ];

  const maintenancePlans = [
    {
      name: 'Basic Maintenance',
      price: '$49',
      currency: 'CAD/month',
      features: ['Hosting', 'Security updates', 'Monthly backups', 'Email support'],
      color: 'from-gray-400 to-gray-600',
    },
    {
      name: 'Pro Maintenance',
      price: '$199',
      currency: 'CAD/month',
      features: [
        'Everything in Basic',
        'Content updates',
        'Performance optimization',
        'Priority support',
        'Monthly reports',
      ],
      color: 'from-blue-400 to-blue-600',
    },
    {
      name: 'Premium Maintenance',
      price: '$300',
      currency: 'CAD/month',
      features: [
        'Everything in Pro',
        'Unlimited updates',
        '24/7 support',
        'Dedicated developer',
        'SEO monitoring',
      ],
      color: 'from-purple-400 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Transparent Pricing</span>
          </motion.div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect solution for your business. Transparent pricing, no hidden fees. All prices in CAD. Custom quotes available.
          </p>
          <Link href="/chat">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Get Started Free
            </motion.div>
          </Link>
        </motion.div>

        {/* Main Plans */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all ${
                  plan.popular ? 'ring-4 ring-purple-200 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg"
                  >
                    Most Popular
                  </motion.div>
                )}
                <div className={`w-14 h-14 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-lg">{plan.currency}</span>
                  </div>
                  {plan.name === 'Landing Page' && (
                    <p className="text-sm text-green-600 font-semibold">✨ Best Value - Starting at $299</p>
                  )}
                  {plan.popular && (
                    <p className="text-sm text-purple-600 font-semibold">🔥 Most Popular Choice</p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <motion.li
                      key={fIdx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + fIdx * 0.05 }}
                      className="flex items-start gap-2"
                    >
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link href="/chat">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full text-center py-3 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {plan.name === 'Landing Page' ? 'Start at $299 →' : plan.popular ? 'Get Started Now →' : 'Get Started →'}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Maintenance Plans */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-16"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Maintenance & Support Plans</h2>
            </div>
            <p className="text-gray-600">Keep your website running smoothly with our maintenance plans</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {maintenancePlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className={`border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br ${plan.color} text-white`}
              >
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="ml-1 opacity-90">{plan.currency}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'How long does it take?',
                a: 'Landing pages: 1-2 weeks. Full websites: 3-6 weeks. Mobile apps: 8-12 weeks.',
              },
              {
                q: 'Do you provide hosting?',
                a: 'Yes! We can host your website or you can use your own hosting. Hosting is included in maintenance plans.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept CAD via Interac e-Transfer, credit card (Stripe), or bank transfer. 50% upfront, 50% on completion.',
              },
              {
                q: 'Can I get a custom quote?',
                a: "Absolutely! Use our AI chat to describe your project and we'll provide a custom quote within 24 hours.",
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-gray-50 rounded-xl"
              >
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Chat with our AI agent to get a custom quote for your project
          </p>
          <Link href="/chat">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all text-lg font-semibold shadow-lg"
            >
              <Sparkles className="w-6 h-6" />
              Start Your Project Now
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
