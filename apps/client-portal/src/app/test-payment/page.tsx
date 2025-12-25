'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { isAuthenticated, isTokenExpired, login as authLogin } from '@/lib/auth';

export default function TestPaymentPage() {
  const [invoiceId, setInvoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    paymentUrl: string;
    sessionId: string;
    provider: string;
  } | null>(null);
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'expired' | 'missing' | 'checking' | 'server-offline'>('checking');
  // @ts-ignore - isApiServerOnline is set but not read (used for future features)
  const [isApiServerOnline, setIsApiServerOnline] = useState(true);

  const handleCreateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoiceId.trim()) {
      setError('Please enter an invoice ID');
      return;
    }

    setLoading(true);
    setError(null);
    setCheckoutData(null);

    try {
      // apiClient automatically handles token refresh on 401
      const response = await apiClient.post('/payments/checkout', {
        invoiceId: invoiceId.trim(),
        successUrl: `${window.location.origin}/payment/success?invoice=${invoiceId}`,
        cancelUrl: `${window.location.origin}/payment/cancel?invoice=${invoiceId}`,
      });

      if (response.data.paymentUrl) {
        setCheckoutData(response.data);
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Token refresh was attempted but failed. Please login again.');
        setTokenStatus('expired');
      } else if (err.response?.status === 404) {
        setError('Invoice not found. Please check the invoice ID.');
      } else if (err.response?.status === 500) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Internal server error';
        setError(`Server error: ${errorMsg}. Check API server logs for details.`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Could not connect to API server. Please ensure it is running.');
        setIsApiServerOnline(false);
      } else {
        setError(err.message || 'Failed to create payment checkout. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToPayment = () => {
    if (checkoutData?.paymentUrl) {
      window.location.href = checkoutData.paymentUrl;
    }
  };

  const checkTokenStatus = async () => {
    if (!isAuthenticated()) {
      setTokenStatus('missing');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (token && isTokenExpired(token)) {
      setTokenStatus('expired');
      setIsApiServerOnline(true);
      return;
    }

    try {
      // apiClient will automatically refresh token if needed
      await apiClient.get('/auth/me', {
        timeout: 5000,
      });
      setTokenStatus('valid');
      setIsApiServerOnline(true);
    } catch (err: any) {
      // Check if it's a connection error (server not running)
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setTokenStatus('server-offline');
        setIsApiServerOnline(false);
        return;
      }
      
      if (err.response?.status === 401) {
        setTokenStatus('expired');
        setIsApiServerOnline(true);
      } else {
        setTokenStatus('expired');
        setIsApiServerOnline(true);
      }
    }
  };

  const refreshToken = async () => {
    setTokenStatus('checking');
    try {
      // Try to use refresh token first (automatic via apiClient)
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // apiClient will handle refresh automatically, but we can also call directly
          const response = await apiClient.post('/auth/refresh', {
            refreshToken,
          });
          if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            setTokenStatus('valid');
            setIsApiServerOnline(true);
            setError(null);
            return;
          }
        } catch (refreshErr) {
          // Refresh token failed, fall back to login
          console.warn('Refresh token failed, falling back to login');
        }
      }

      // Fallback: login with credentials (for test page only)
      const response = await authLogin({
        email: 'admin@abellabs.ca',
        password: 'admin123',
      });

      if (response.accessToken) {
        setTokenStatus('valid');
        setIsApiServerOnline(true);
        setError(null);
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('API server is not running. Please start it with: yarn dev');
        setTokenStatus('server-offline');
        setIsApiServerOnline(false);
      } else {
        setError('Failed to refresh token. Please login manually.');
        setTokenStatus('expired');
        setIsApiServerOnline(true);
      }
    }
  };

  useEffect(() => {
    checkTokenStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CreditCard className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Payment System</h1>
            <p className="text-gray-600">
              Create a payment checkout session to test the payment integration
            </p>
          </div>

          {/* Token Status */}
          {tokenStatus !== 'checking' && (
            <div className="mb-6">
              {tokenStatus === 'missing' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">No authentication token found</p>
                      <p className="text-sm text-yellow-600">Please login to continue</p>
                    </div>
                  </div>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Go to Login
                  </Link>
                </div>
              )}
              {tokenStatus === 'expired' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Authentication token expired</p>
                      <p className="text-sm text-red-600">Automatic refresh failed. Click below to login again</p>
                    </div>
                  </div>
                  <button
                    onClick={refreshToken}
                    disabled={(tokenStatus as string) === 'checking' || (tokenStatus as string) === 'server-offline'}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {(tokenStatus as string) === 'checking' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh Token
                  </button>
                </div>
              )}
              {tokenStatus === 'valid' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Authentication token is valid</p>
                    <p className="text-sm text-green-600">Tokens will refresh automatically when needed</p>
                  </div>
                </div>
              )}
              {tokenStatus === 'server-offline' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800">API Server is not running</p>
                      <p className="text-sm text-orange-600 mt-1">
                        The API server at <code className="bg-orange-100 px-1 rounded">http://localhost:3001</code> is not accessible.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <p className="text-sm font-medium text-orange-800 mb-2">To fix this:</p>
                    <ol className="text-sm text-orange-700 space-y-1 ml-4 list-decimal">
                      <li>Open your terminal</li>
                      <li>Run: <code className="bg-orange-100 px-1 rounded">yarn dev</code></li>
                      <li>Wait for the API server to start (look for "API server running on http://localhost:3001")</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleCreateCheckout} className="space-y-6">
            <div>
              <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700 mb-2">
                Invoice ID
              </label>
              <input
                id="invoiceId"
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="Enter invoice ID (e.g., inv_123)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the ID of an invoice you want to pay. The system will automatically route to the correct payment provider based on currency.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {checkoutData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Checkout Session Created!</p>
                    <p className="text-sm text-green-600 mt-1">
                      Provider: <span className="font-mono">{checkoutData.provider}</span>
                    </p>
                    <p className="text-sm text-green-600">
                      Session ID: <span className="font-mono text-xs">{checkoutData.sessionId}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRedirectToPayment}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  Go to Payment Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !!checkoutData}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Checkout Session...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Create Payment Checkout
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">How to Test:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">1.</span>
                <span>Make sure you're logged in (check localStorage for accessToken)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">2.</span>
                <span>Create an invoice via admin dashboard or API</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">3.</span>
                <span>Enter the invoice ID above</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">4.</span>
                <span>Click "Create Payment Checkout"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">5.</span>
                <span>You'll be redirected to Stripe (CAD/USD) or Chapa (ETB)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">6.</span>
                <span>Use test card: <code className="bg-gray-100 px-1 rounded">4242 4242 4242 4242</code></span>
              </li>
            </ol>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/payment/success"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Success Page →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



