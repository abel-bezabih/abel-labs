'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Magnetic } from '../../components/magnetic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/leads`, {
        name: form.name,
        email: form.email,
        project: form.message,
      });
      setIsSubmitted(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to send message. Please try again or email us directly.');
      console.error('Failed to submit contact form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@abellabs.ca',
      link: 'mailto:hello@abellabs.ca',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '(604) 977-6878',
      link: 'tel:+16049776878',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Burnaby, BC, Canada',
      link: '#',
      color: 'from-green-500 to-emerald-500',
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
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Have a project in mind? Let's talk about how we can help bring your vision to life.
          </motion.p>
        </div>
      </motion.section>

      <div className="container mx-auto max-w-6xl px-4 pb-24">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Let's Connect</h2>
              <p className="text-gray-600 mb-8">
                We're here to help! Reach out through any of these channels, or use the form to send us a message.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.a
                    key={index}
                    href={info.link}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 8 }}
                    className="flex items-center gap-4 p-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{info.label}</div>
                      <div className="text-lg font-semibold text-gray-900">{info.value}</div>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white"
            >
              <h3 className="text-xl font-bold mb-2">Response Time</h3>
              <p className="text-white/90">
                We typically respond within 24 hours. For urgent matters, please call us directly.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200 shadow-xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Send us a Message</h2>

            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-800">Message sent successfully! We'll get back to you soon.</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
              >
                <span className="text-red-800">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>

              <Magnetic>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </Magnetic>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


