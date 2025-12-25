'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowLeft,
  Download,
  Filter,
  DollarSign,
  Calendar,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  transactionId?: string;
  createdAt: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    project: {
      id: string;
      title: string;
    };
  };
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, providerFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (providerFilter !== 'all') params.append('provider', providerFilter);

      const response = await apiClient.get(`/payments/history?${params.toString()}`);
      setPayments(response.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please login to view payment history.');
      } else {
        setError(err.response?.data?.message || 'Failed to load payment history.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Completed',
        };
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Pending',
        };
      case 'PROCESSING':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Processing',
        };
      case 'FAILED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Failed',
        };
      case 'REFUNDED':
        return {
          icon: ArrowLeft,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Refunded',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: status,
        };
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'STRIPE':
        return <CreditCard className="w-4 h-4" />;
      case 'CHAPA':
      case 'TELEBIRR':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
              <p className="text-gray-600">View all your past payments and transactions</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalPaid > 0 
                      ? `${totalPaid.toLocaleString()} ${payments[0]?.currency || ''}`
                      : '0'
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {payments.filter(p => p.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 grid md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <select
                    value={providerFilter}
                    onChange={(e) => setProviderFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Providers</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="CHAPA">Chapa</option>
                    <option value="TELEBIRR">Telebirr</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Payments List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading payment history...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchPayments}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
            >
              Try Again
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2 text-lg font-medium">No payments found</p>
            <p className="text-sm text-gray-400 mb-6">
              {statusFilter !== 'all' || providerFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Your payment history will appear here once you make payments'}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">All Payments</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredPayments.map((payment, idx) => {
                const statusInfo = getStatusInfo(payment.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            Invoice #{payment.invoice.invoiceNumber}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.borderColor} border ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Project: {payment.invoice.project.title}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            {getProviderIcon(payment.provider)}
                            {payment.provider}
                          </span>
                          {payment.transactionId && (
                            <span className="font-mono text-xs">
                              {payment.transactionId.substring(0, 20)}...
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-2xl text-gray-900 mb-2">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <a
                          href={`${API_URL}/invoices/${payment.invoice.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download Receipt
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}






