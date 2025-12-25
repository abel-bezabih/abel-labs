'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle2, CreditCard, Globe, Smartphone, ShoppingCart, FileText } from 'lucide-react';
import Link from 'next/link';

const SERVICE_TYPES = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Professional single-page website',
    price: { cad: 599, usd: 449 },
    icon: FileText,
  },
  {
    id: 'full-website',
    name: 'Full Website',
    description: 'Complete multi-page website',
    price: { cad: 1499, usd: 1099 },
    icon: Globe,
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Online store with payment integration',
    price: { cad: 3500, usd: 2625 },
    icon: ShoppingCart,
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'iOS and Android mobile application',
    price: { cad: 7000, usd: 5250 },
    icon: Smartphone,
  },
];

export default function RequestServicePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceType: '',
    currency: 'CAD',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = SERVICE_TYPES.find(s => s.id === formData.serviceType);
  const amount = selectedService 
    ? (formData.currency === 'CAD' ? selectedService.price.cad : selectedService.price.usd)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.serviceType) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Call API to create checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          amount,
          currency: formData.currency,
          customerEmail: formData.email,
          customerName: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Request a Service
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to get started with your project
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Service Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Service</h2>
            {SERVICE_TYPES.map((service) => {
              const Icon = service.icon;
              const isSelected = formData.serviceType === service.id;
              const price = formData.currency === 'CAD' ? service.price.cad : service.price.usd;
              
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, serviceType: service.id })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {formData.currency === 'CAD' ? 'C$' : '$'}{price.toLocaleString()}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, currency: 'CAD' })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                      formData.currency === 'CAD'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    CAD (C$)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, currency: 'USD' })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                      formData.currency === 'USD'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              {/* Total */}
              {selectedService && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formData.currency === 'CAD' ? 'C$' : '$'}{amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !selectedService}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                You will be redirected to Stripe Checkout to complete your payment securely
              </p>
            </form>
          </motion.div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

