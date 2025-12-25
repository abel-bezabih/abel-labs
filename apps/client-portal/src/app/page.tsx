'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Globe,
  Smartphone,
  ShoppingCart,
  Zap,
  Shield,
  Users,
  TrendingUp,
  CheckCircle2,
  Quote,
  Mail,
  Layers,
} from 'lucide-react';
import { Magnetic } from '../components/magnetic';

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

export default function HomePage() {
  const [form, setForm] = useState({ name: '', email: '', project: '' });
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const portfolioRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const { scrollYProgress: portfolioScroll } = useScroll({
    target: portfolioRef,
    offset: ['start end', 'end start'],
  });
  const portfolioY = useTransform(portfolioScroll, [0, 1], [0, -40]);
  const portfolioGlow = useTransform(portfolioScroll, [0, 1], [0.4, 0.8]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValid = /\S+@\S+\.\S+/.test(form.email);
    if (!form.name || !emailValid || !form.project) {
      setToast('Please provide a name, valid email, and project details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setToast('Thanks! We received your request and will reply within 24 hours.');
        setForm({ name: '', email: '', project: '' });
        
        // Track conversion in GA
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'lead_submitted', {
            event_category: 'engagement',
            event_label: 'contact_form',
          });
        }
      } else {
        setToast('Something went wrong. Please try again or email us directly.');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setToast('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        
        <div ref={heroRef} className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>Professional Software Development</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ y: parallaxY, opacity: parallaxOpacity }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Build Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Digital Future
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
            >
              From concept to launch, we turn your vision into stunning websites and mobile apps.
              Powered by AI, perfected by experts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <Link href="/chat">
            <Magnetic>
              <motion.div
                whileHover={{ scale: 1.07, rotate: -0.25 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Start Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Magnetic>
              </Link>
              <Link href="/pricing">
            <Magnetic strength={10}>
              <motion.div
                whileHover={{ scale: 1.06, rotate: 0.2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-semibold text-lg shadow-lg hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                View Pricing
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Magnetic>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 max-w-4xl mx-auto mt-20"
          >
            {[
              { value: '100+', label: 'Projects Delivered' },
              { value: '50+', label: 'Happy Clients' },
              { value: '24/7', label: 'AI Support' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                whileHover={{ rotateX: -2, rotateY: 3, scale: 1.03 }}
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg"
                style={{ transformPerspective: 900 }}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              What We Build
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge solutions tailored to your business needs
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Globe,
                title: 'Landing Pages',
                description: 'High-converting landing pages that turn visitors into customers',
                price: 'From $299 CAD',
                priceRange: '$299 - $599',
                color: 'from-blue-500 to-cyan-500',
                features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Modern UI/UX'],
                badge: 'Best Value',
              },
              {
                icon: Layers,
                title: 'Full Websites',
                description: 'Complete websites that grow your business online',
                price: 'From $599 CAD',
                priceRange: '$599 - $1,499',
                color: 'from-cyan-500 to-blue-600',
                features: ['5-10 Pages', 'CMS Integration', 'Blog Setup', 'Advanced SEO'],
                popular: true,
              },
              {
                icon: ShoppingCart,
                title: 'E-commerce Stores',
                description: 'Complete online stores that sell 24/7',
                price: 'From $1,799 CAD',
                priceRange: '$1,799 - $3,500',
                color: 'from-green-500 to-emerald-500',
                features: ['Payment Integration', 'Inventory Management', 'Order Tracking', 'Analytics'],
              },
              {
                icon: Smartphone,
                title: 'Mobile Apps',
                description: 'Native iOS & Android apps that engage users and drive growth',
                price: 'From $3,100 CAD',
                priceRange: '$3,100 - $7,000',
                color: 'from-purple-500 to-pink-500',
                features: ['iOS & Android', 'App Store Ready', 'Push Notifications', 'Offline Support'],
              },
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -8, rotateX: -2, rotateY: 2, scale: 1.03, transition: { duration: 0.25 } }}
                  className={`relative p-6 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-xl hover:shadow-2xl transition-all ${
                    service.popular ? 'lg:scale-105 ring-4 ring-purple-200' : ''
                  }`}
                  style={{ transformPerspective: 900 }}
                >
                  {service.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      🔥 Most Popular
                    </div>
                  )}
                  {service.badge && !service.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ✨ {service.badge}
                    </div>
                  )}
                  <div className="mb-4">
                    <Icon className="w-10 h-10 mb-3" />
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-white/90 text-sm mb-3">{service.description}</p>
                    <div className="mb-2">
                      <div className="text-2xl font-bold">{service.price}</div>
                      {service.priceRange && (
                        <div className="text-xs text-white/80 mt-1">{service.priceRange} CAD</div>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4 text-sm">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/chat">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors"
                    >
                      Get Started
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose Abel Labs?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine AI-powered efficiency with human creativity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'AI-Powered',
                description: 'Our AI agent understands your needs instantly and creates detailed project briefs',
                color: 'text-yellow-500',
                bg: 'bg-yellow-50',
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description: 'Enterprise-grade security with encrypted payments and data protection',
                color: 'text-green-500',
                bg: 'bg-green-50',
              },
              {
                icon: Users,
                title: 'Expert Team',
                description: 'Experienced developers and designers who bring your vision to life',
                color: 'text-blue-500',
                bg: 'bg-blue-50',
              },
              {
                icon: TrendingUp,
                title: 'Proven Results',
                description: 'Track record of successful projects and satisfied clients',
                color: 'text-purple-500',
                bg: 'bg-purple-50',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, rotateX: -2, rotateY: 2, scale: 1.03, transition: { duration: 0.25 } }}
                  className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  style={{ transformPerspective: 900 }}
                >
                  <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent"
          style={{ opacity: portfolioGlow }}
        />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Recent Work
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Silicon Valley-level polish with performance, security, and delightful UX.
            </p>
          </motion.div>

          <motion.div
            ref={portfolioRef}
            style={{ y: portfolioY }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Vancouver Artisan Marketplace',
                desc: 'Full-stack online marketplace for Canadian artisans. Built with Next.js, Stripe integration, and real-time inventory management. Launched in 4 weeks.',
                stats: '↑ 45% sales growth, 2.3s load time',
              },
              {
                title: 'HealthConnect Mobile App',
                desc: 'Telemedicine platform connecting patients with doctors across Canada. React Native app with secure video calls, prescription management, and payment integration.',
                stats: '10k+ downloads, 4.8★ rating',
              },
              {
                title: 'Fintech Analytics Dashboard',
                desc: 'Real-time financial analytics platform for Canadian financial institutions. Custom data visualizations, secure API integrations, and role-based access control.',
                stats: '↑ 60% user engagement, 99.9% uptime',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10, rotateX: -2.5, rotateY: 2.5, scale: 1.04 }}
                transition={{ duration: 0.25 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border border-slate-800"
                style={{ transformPerspective: 1100 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-8 relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
                    <Sparkles className="w-4 h-4" />
                    Case Study
                  </div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-slate-200">{item.desc}</p>
                  <div className="text-sm text-blue-100 font-semibold">{item.stats}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4">Loved by forward-thinking teams</h2>
            <p className="text-lg text-slate-200">Real results, happy clients, repeat business.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah M.',
                role: 'CEO, Vancouver Artisan Collective',
                quote: 'Abel Labs delivered our e-commerce platform in 4 weeks. Sales increased 45% in the first month. The team is professional, responsive, and truly understands our market.',
              },
              {
                name: 'Dr. James A.',
                role: 'Founder, HealthConnect Canada',
                quote: 'The mobile app they built transformed our patient experience. Secure, fast, and beautifully designed. Their AI-powered intake process saved us countless hours of back-and-forth.',
              },
              {
                name: 'Michael W.',
                role: 'Head of Product, Canadian FinTech Solutions',
                quote: 'World-class dashboard that our team actually enjoys using. The performance is incredible, and the attention to detail shows. Abel Labs is the real deal.',
              },
            ].map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="p-8 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur"
              >
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-lg text-slate-100 mb-4 leading-relaxed">“{t.quote}”</p>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-slate-300">{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline + CTA Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Our Process (fast & clear)
            </motion.h2>
            <p className="text-gray-600 mb-8">From idea to launch with speed, clarity, and quality.</p>

            <div className="space-y-6">
              {[
                { step: '1. Discover', desc: 'AI intake + consultation to align on goals' },
                { step: '2. Design', desc: 'World-class UI/UX prototypes and flows' },
                { step: '3. Build', desc: 'Fast, secure engineering with clear sprints' },
                { step: '4. Launch', desc: 'Testing, payment, handover, and support' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-gray-900">{item.step}</div>
                    <div className="text-gray-600">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Get a tailored quote</h3>
              <p className="text-gray-600 mb-6">Tell us about your project. We reply within 24 hours.</p>

              {toast && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3 text-sm">
                  {toast}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Name</label>
                  <input
                    className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Project</label>
                  <textarea
                    className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Tell us about your project goals, timeline, and budget."
                    rows={4}
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-5 h-5" />
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-6">Ready to Build Something Amazing?</h2>
            <p className="text-xl text-white/90 mb-8">
              Chat with our AI agent right now - it's free and takes just 5 minutes to get a custom quote.
            </p>
            <Link href="/chat">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-2xl hover:bg-gray-100 transition-all"
              >
                <Sparkles className="w-6 h-6" />
                Start Free Consultation
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
