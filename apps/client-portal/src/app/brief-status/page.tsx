'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Receipt,
  DollarSign,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Brief {
  id: string;
  projectType: string;
  businessType?: string;
  status: string;
  summary: string;
  budgetRange?: string;
  approvedBudget?: number;
  approvedCurrency?: string;
  approvedDeadline?: string;
  adminNotes?: string;
  project?: {
    id: string;
    title: string;
    status: string;
    budget: number;
    currency: string;
  };
  conversation?: {
    sessionId: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export default function BriefStatusPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const briefId = searchParams.get('briefId');

  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrief = async () => {
      if (briefId) {
        try {
          const response = await apiClient.get(`/project-briefs/${briefId}`);
          setBrief(response.data);
          setError(null);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setError('Brief not found. Please check the brief ID.');
          } else if (err.response?.status === 401) {
            setError('Please login to view this brief.');
          } else {
            setError(err.response?.data?.message || 'Failed to load brief details.');
          }
        } finally {
          setLoading(false);
        }
      } else if (sessionId) {
        // Try to find brief by session ID
        try {
          const response = await apiClient.get(`/conversations/${sessionId}`);
          if (response.data.projectBrief) {
            setBrief(response.data.projectBrief);
            setError(null);
          } else {
            setError('No brief found for this conversation. The brief may still be generating.');
          }
        } catch (err: any) {
          setError('Failed to load brief. Please check the session ID.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('No brief ID or session ID provided.');
        setLoading(false);
      }
    };

    fetchBrief();
  }, [briefId, sessionId]);

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
          <p className="text-gray-600">Loading brief status...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error || 'Brief not found'}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Approved',
          message: 'Your project has been approved!',
        };
      case 'PENDING_REVIEW':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Pending Review',
          message: 'Your brief is being reviewed. We\'ll notify you once approved.',
        };
      case 'CANCELLED':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Cancelled',
          message: 'This brief has been cancelled.',
        };
      default:
        return {
          icon: FileText,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: status,
          message: 'Brief status',
        };
    }
  };

  const statusInfo = getStatusInfo(brief.status);
  const StatusIcon = statusInfo.icon;
  const isApproved = brief.status === 'APPROVED';
  const hasProject = !!brief.project;
  const hasInvoice = hasProject; // If project exists, invoice might exist

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Project Brief Status</h1>
                <p className="text-blue-100">
                  {brief.businessType ? `${brief.businessType} - ` : ''}
                  {brief.projectType}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                  <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Status Message */}
            <div className={`p-4 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
              <div className="flex items-start gap-3">
                <StatusIcon className={`w-5 h-5 ${statusInfo.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`font-medium ${statusInfo.color}`}>{statusInfo.message}</p>
                  {brief.status === 'PENDING_REVIEW' && (
                    <p className="text-sm text-gray-600 mt-1">
                      We typically review briefs within 24 hours. You'll receive an email notification once your project is approved.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Brief Summary */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Project Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{brief.summary}</p>
              
              {brief.budgetRange && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">Estimated Budget:</span>
                    <span className="text-gray-900">{brief.budgetRange}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Approved Details */}
            {isApproved && brief.approvedBudget && (
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-6 h-6" />
                  Approved Details
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved Budget</p>
                    <p className="text-2xl font-bold text-green-700">
                      {brief.approvedBudget.toLocaleString()} {brief.approvedCurrency}
                    </p>
                  </div>
                  {brief.approvedDeadline && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Expected Deadline</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(brief.approvedDeadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {brief.adminNotes && (
                    <div className="md:col-span-3">
                      <p className="text-sm text-gray-600 mb-1">Notes</p>
                      <p className="text-gray-700">{brief.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Info */}
            {hasProject && brief.project && (
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-800">
                  <Sparkles className="w-6 h-6" />
                  Your Project
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Project Title</p>
                    <p className="text-lg font-semibold text-gray-900">{brief.project.title}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {brief.project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Budget</p>
                      <p className="font-semibold text-gray-900">
                        {brief.project.budget.toLocaleString()} {brief.project.currency}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/projects/${brief.project.id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-2"
                  >
                    View Project Details
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Invoice Info */}
            {hasProject && (
              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-800">
                  <Receipt className="w-6 h-6" />
                  Payment
                </h2>
                <p className="text-gray-700 mb-4">
                  {hasInvoice 
                    ? 'An invoice has been created for your project. You can view and pay it from your dashboard.'
                    : 'An invoice will be created once your project is set up. You\'ll receive a notification when it\'s ready.'}
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <DollarSign className="w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}

            {/* Next Steps */}
            {!isApproved && (
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                  What's Next?
                </h2>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">1.</span>
                    <span>We're reviewing your project brief</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">2.</span>
                    <span>You'll receive an email once it's approved (usually within 24 hours)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">3.</span>
                    <span>Once approved, a project and invoice will be created</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">4.</span>
                    <span>You can then make payment and we'll start working on your project</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-center"
              >
                Back to Dashboard
              </Link>
              {!isApproved && (
                <Link
                  href="/contact"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-center"
                >
                  Contact Us
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

