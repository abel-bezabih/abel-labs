'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, CheckCircle2, AlertCircle, ArrowRight, Receipt, Calendar, DollarSign, Building2, Download } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  project: {
    id: string;
    title: string;
    client: {
      name: string;
      email: string;
    };
  };
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get invoiceId from URL params
  useEffect(() => {
    const id = searchParams.get('invoiceId');
    setInvoiceId(id);
    
    if (!id) {
      setError('No invoice ID provided. Please select an invoice from your dashboard.');
      setLoading(false);
      return;
    }
  }, [searchParams]);

  useEffect(() => {
    if (!invoiceId) {
      return;
    }

    // Fetch invoice details
    const fetchInvoice = async () => {
      try {
        const response = await apiClient.get(`/invoices/${invoiceId}`);
        setInvoice(response.data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Invoice not found. Please check the invoice ID.');
        } else if (err.response?.status === 401) {
          setError('Please login to view this invoice.');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setError(err.response?.data?.message || 'Failed to load invoice details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, router]);

  const handlePayNow = async () => {
    if (!invoice || invoice.status === 'PAID') {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await apiClient.post('/payments/checkout', {
        invoiceId: invoice.id,
        successUrl: `${window.location.origin}/payment/success?invoice=${invoice.id}`,
        cancelUrl: `${window.location.origin}/payment/cancel?invoice=${invoice.id}`,
      });

      if (response.data.paymentUrl) {
        // Redirect to payment provider (Stripe, Chapa, etc.)
        window.location.href = response.data.paymentUrl;
      } else {
        setError('Invalid response from payment provider');
        setProcessing(false);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Invoice not found. Please check the invoice ID.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid payment request.');
      } else if (err.response?.status === 500) {
        setError('Payment service error. Please try again later.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Could not connect to payment service. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'Failed to create payment checkout. Please try again.');
      }
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice details...</p>
        </motion.div>
      </div>
    );
  }

  // Manual invoice ID input if not in URL
  const [manualInvoiceId, setManualInvoiceId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInvoiceId.trim()) {
      router.push(`/payment?invoiceId=${manualInvoiceId.trim()}`);
    }
  };

  if (error && !invoice && !showManualInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Invoice ID</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                Enter Invoice ID Manually
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold w-full justify-center"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showManualInput && !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <Receipt className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Invoice ID</h1>
            <p className="text-gray-600">Please enter your invoice ID or invoice number</p>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="manualInvoiceId" className="block text-sm font-medium text-gray-700 mb-2">
                Invoice ID or Number
              </label>
              <input
                id="manualInvoiceId"
                type="text"
                value={manualInvoiceId}
                onChange={(e) => setManualInvoiceId(e.target.value)}
                placeholder="Enter invoice ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowManualInput(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Continue
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const isPaid = invoice.status === 'PAID';
  const isOverdue = !isPaid && new Date(invoice.dueDate) < new Date();
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Invoice Payment</h1>
                <p className="text-blue-100">
                  {invoice.invoiceNumber ? (
                    <>Invoice #{invoice.invoiceNumber}</>
                  ) : (
                    <>Invoice ID: {invoice.id?.slice(0, 12) || 'N/A'}</>
                  )}
                </p>
              </div>
              <div className="text-right">
                {isPaid ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    Paid
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    Overdue
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded-lg">
                    <Calendar className="w-5 h-5" />
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Project Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Project</h3>
              </div>
              <p className="text-gray-700 ml-8">{invoice.project.title}</p>
            </div>

            {/* Invoice Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Invoice Items
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                      invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {item.unitPrice.toLocaleString()} {invoice.currency}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {item.total.toLocaleString()} {invoice.currency}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 text-center">
                          No items listed
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">Due Date:</span>
                </div>
                <span className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {dueDate}
                </span>
              </div>
              <div className="flex items-center justify-between text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-gray-600" />
                  <span>Total Amount</span>
                </div>
                <span>
                  {invoice.amount.toLocaleString()} {invoice.currency}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <a
                href={`${API_URL}/invoices/${invoice.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </a>
              {!isPaid && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayNow}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Pay Now
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {isPaid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">This invoice has been paid</p>
                  <p className="text-sm text-green-600">Thank you for your payment!</p>
                </div>
              </div>
            )}

            {/* Back to Dashboard */}
            <div className="mt-6 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

