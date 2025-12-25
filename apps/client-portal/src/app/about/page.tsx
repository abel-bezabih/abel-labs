'use client';

import { motion } from 'framer-motion';
import { Sparkles, Target, Heart, Zap, Code } from 'lucide-react';
import { Magnetic } from '../../components/magnetic';

// Animation variants removed - not currently used in this component

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We exist to help Canadian businesses thrive in the digital age.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'Leveraging cutting-edge AI and modern tech to deliver exceptional results.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Heart,
      title: 'Client-Centric',
      description: 'Your success is our success. We build lasting partnerships.',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Code,
      title: 'Quality Code',
      description: 'Clean, scalable, and maintainable solutions that stand the test of time.',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const team = [
    {
      name: 'Abel B.',
      role: 'Founder & Lead Developer',
      bio: 'Full-stack developer with 5+ years building scalable web and mobile applications.',
      image: '👨‍💻',
    },
    {
      name: 'AI Team',
      role: 'Abel AI Engineers',
      bio: 'Our AI-powered assistant trained on thousands of successful projects.',
      image: '🤖',
    },
  ];

  const stats = [
    { number: '50+', label: 'Projects Delivered' },
    { number: '30+', label: 'Happy Clients' },
    { number: '98%', label: 'Client Satisfaction' },
    { number: '24/7', label: 'AI Support' },
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">About Abel Labs</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Building the Future of Digital Canada
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            We're a forward-thinking software company combining human creativity with AI-powered efficiency to deliver world-class digital solutions for Canadian businesses.
          </motion.p>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-lg"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Story */}
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
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Abel Labs was born from a simple observation: Canadian businesses deserve world-class digital solutions at accessible prices. Too many local companies were either paying premium prices for mediocre work or struggling with outdated technology.
              </p>
              <p>
                We set out to change that by combining cutting-edge AI technology with deep local market understanding. Our AI-powered assistant, Abel, helps us understand your needs faster and deliver solutions that truly fit your business.
              </p>
              <p>
                Today, we're proud to have helped dozens of Canadian businesses establish their online presence, launch mobile apps, and scale their operations—all while maintaining the personal touch and quality that sets us apart.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Values */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Our Values</h2>
            <p className="text-xl text-gray-600">What drives everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Team */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 px-4 bg-white/50"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Meet the Team</h2>
            <p className="text-xl text-gray-600">The people behind Abel Labs</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-lg text-center"
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
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
            <h2 className="text-4xl font-bold mb-4">Ready to Work Together?</h2>
            <p className="text-xl mb-8 text-white/90">
              Let's build something amazing for your business
            </p>
            <Magnetic>
              <motion.a
                href="/pricing"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
                <Sparkles className="w-5 h-5" />
              </motion.a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}


