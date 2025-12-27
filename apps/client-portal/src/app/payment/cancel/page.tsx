'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw, Receipt } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  project: {
    id: string;
    title: string;
  };
}

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (invoiceId) {
      apiClient.get(`/invoices/${invoiceId}`)
        .then((response) => {
          setInvoice(response.data);
        })
        .catch(() => {
          // Ignore errors, invoice might not be accessible
        });
    }
  }, [invoiceId]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto"
          >
            <XCircle className="w-12 h-12 text-red-600" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>

        {invoice && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Invoice Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice:</span>
                <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">
                  {invoice.amount.toLocaleString()} {invoice.currency}
                </span>
              </div>
              {invoice.project && (
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Project:</span>
                  <span className="font-medium text-gray-900">{invoice.project.title}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            If you encountered any issues or have questions, please don't hesitate to contact us.
          </p>
        </div>

        <div className="space-y-3">
          {invoice && (
            <Link
              href={`/payment?invoiceId=${invoice.id}`}
              className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Payment Again
            </Link>
          )}

          <Link
            href="/dashboard"
            className="block w-full border-2 border-blue-300 text-blue-700 py-3 px-6 rounded-lg font-semibold hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Receipt className="w-5 h-5" />
            View Invoices
          </Link>

          <Link
            href="/"
            className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Home
          </Link>

          <Link
            href="/contact"
            className="block w-full text-blue-600 hover:text-blue-700 font-medium py-2"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}

