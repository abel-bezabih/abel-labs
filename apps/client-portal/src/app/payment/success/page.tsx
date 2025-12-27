'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, ArrowRight, Receipt, FileText } from 'lucide-react';
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

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const sessionId = searchParams.get('session_id');
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!invoiceId) {
        setIsLoading(false);
        return;
      }

      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fetch invoice to check payment status
        const response = await apiClient.get(`/invoices/${invoiceId}`);
        setInvoice(response.data);
        
        // If payment not confirmed yet, check again after a delay
        if (response.data.status !== 'PAID') {
          setTimeout(async () => {
            try {
              const retryResponse = await apiClient.get(`/invoices/${invoiceId}`);
              setInvoice(retryResponse.data);
            } catch (err) {
              // Ignore retry errors
            }
          }, 3000);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Please login to view payment details.');
        } else {
          setError('Could not verify payment. Please check your dashboard.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [invoiceId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {isLoading ? (
          <div className="py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying payment...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for your payment. We've received your payment and will begin working on your project shortly.
            </p>

            {invoice && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Receipt className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="text-2xl font-bold text-green-700">
                      {invoice.amount.toLocaleString()} {invoice.currency}
                    </span>
                  </div>
                  {invoice.project && (
                    <div className="flex justify-between items-center pt-3 border-t border-green-200">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-semibold text-gray-900">{invoice.project.title}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Payment Confirmed</span>
                  </div>
                </div>
              </div>
            )}

            {!invoice && sessionId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Session ID:</p>
                <p className="text-xs font-mono text-gray-800 break-all">{sessionId}</p>
              </div>
            )}

            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Check your email</p>
                  <p className="text-xs text-gray-600 mt-1">
                    We've sent a confirmation email with your receipt and next steps.
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  href="/dashboard"
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {invoice?.project && (
                  <Link
                    href={`/projects/${invoice.project.id}`}
                    className="block w-full border-2 border-blue-300 text-blue-700 py-3 px-6 rounded-lg font-semibold hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                  >
                    View Project
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}

                <Link
                  href="/"
                  className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-gray-400 transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

