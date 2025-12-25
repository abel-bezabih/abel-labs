'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is Abel Labs?',
          a: 'Abel Labs is a software company based in Burnaby, BC, Canada. We specialize in building websites, mobile apps, and custom software solutions for businesses. Our unique approach combines AI-powered assistance with expert human developers to deliver high-quality results efficiently.',
        },
        {
          q: 'How does the AI assistant (Abel) work?',
          a: 'Abel is our AI-powered consultant that helps us understand your project requirements quickly. You can chat with Abel on our website, and it will guide you through the process of describing your project, which then gets converted into a detailed project brief for our team to review.',
        },
        {
          q: 'Where are you located?',
          a: 'We are based in Burnaby, BC, Canada, but we work with clients from all over the world. Our team is distributed and we can work remotely with clients anywhere.',
        },
        {
          q: 'What technologies do you use?',
          a: 'We use modern, industry-standard technologies including Next.js, React, React Native, Node.js, PostgreSQL, and more. We stay up-to-date with the latest tools and frameworks to deliver the best solutions.',
        },
      ],
    },
    {
      category: 'Pricing & Payment',
      questions: [
        {
          q: 'How much does a website cost?',
          a: 'Our pricing depends on the scope and complexity of your project. A simple landing page starts at just $299 CAD, while a full website ranges from $599-$1,499 CAD. E-commerce stores start at $2,499 CAD. Contact us for a custom quote tailored to your needs.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept payments in CAD via Interac e-Transfer, credit card (Stripe), or bank transfer. For international clients, we also accept USD via Stripe.',
        },
        {
          q: 'Do you require a deposit?',
          a: 'Yes, we typically require a 50% deposit to begin work, with the remaining balance due upon project completion. This helps us ensure commitment from both sides and allows us to allocate resources to your project.',
        },
        {
          q: 'Can I pay in installments?',
          a: 'For larger projects, we can arrange payment plans. Please discuss this with us during the project briefing phase, and we can create a payment schedule that works for both parties.',
        },
      ],
    },
    {
      category: 'Project Process',
      questions: [
        {
          q: 'How long does a project take?',
          a: 'Project timelines vary based on complexity. A simple landing page typically takes 1-2 weeks, while a full website takes 3-6 weeks. Mobile apps usually take 6-12 weeks. We provide detailed timelines during the project briefing phase.',
        },
        {
          q: 'What is included in the project?',
          a: 'Each project includes design, development, testing, and deployment. We also provide documentation, training (if needed), and a period of free support after launch. Specific inclusions are detailed in your project brief.',
        },
        {
          q: 'Can I request changes during development?',
          a: 'Yes! We encourage feedback throughout the development process. Minor changes are included, while major scope changes may require additional time and cost. We maintain clear communication throughout the project.',
        },
        {
          q: 'Will I own the code?',
          a: 'Yes, once the project is fully paid, you own all rights to the code and design. We can also provide you with access to the code repository if needed.',
        },
      ],
    },
    {
      category: 'Support & Maintenance',
      questions: [
        {
          q: 'Do you provide ongoing support?',
          a: 'Yes! We offer maintenance and support packages starting at just $49 CAD/month. This includes bug fixes, security updates, performance monitoring, and technical support. All projects come with a free support period after launch.',
        },
        {
          q: 'What if I need updates after launch?',
          a: 'We offer ongoing maintenance packages, or you can request updates on a per-project basis. We can add new features, make changes, or help with any issues that arise.',
        },
        {
          q: 'Do you provide hosting?',
          a: 'We can help you set up hosting and manage it, or you can host it yourself. We recommend reliable hosting providers and can assist with deployment and configuration.',
        },
        {
          q: 'What happens if there are bugs?',
          a: 'We provide a warranty period after launch where we fix any bugs free of charge. After that, our maintenance packages include bug fixes, or we can address issues on a case-by-case basis.',
        },
      ],
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Frequently Asked Questions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Got Questions?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Find answers to common questions about our services, pricing, and process.
          </motion.p>
        </div>
      </motion.section>

      {/* FAQ Sections */}
      <div className="container mx-auto max-w-4xl px-4 pb-24">
        {faqs.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900">{category.category}</h2>
            <div className="space-y-4">
              {category.questions.map((faq, index) => {
                const globalIndex = categoryIndex * 100 + index;
                const isOpen = openIndex === globalIndex;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 text-gray-600 leading-relaxed">{faq.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

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
            <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-xl mb-8 text-white/90">
              Can't find what you're looking for? Get in touch and we'll be happy to help.
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Contact Us
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}


