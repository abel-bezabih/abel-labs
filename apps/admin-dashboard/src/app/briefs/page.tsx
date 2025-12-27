'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  FileText,
  DollarSign,
  Loader2,
  Edit,
  X,
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProjectBrief {
  id: string;
  projectType: string;
  businessType?: string;
  summary: string;
  status: string;
  approvedBudget?: number;
  approvedCurrency?: string;
  approvedDeadline?: string;
  adminNotes?: string;
  createdAt: string;
  budgetRange?: string;
  timeline?: string;
  conversation?: {
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
  project?: {
    id: string;
    title: string;
    invoices?: Array<{
      id: string;
      invoiceNumber: string;
      amount: number;
      currency: string;
      status: string;
      dueDate?: string;
      items?: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
    }>;
  };
}

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<ProjectBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState<string | null>(null);
  const [approveForm, setApproveForm] = useState({
    approvedBudget: '',
    approvedCurrency: 'CAD' as 'CAD' | 'USD' | 'ETB',
    approvedDeadline: '',
    adminNotes: '',
  });
  const [rejectForm, setRejectForm] = useState({ adminNotes: '' });
  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    currency: 'CAD' as 'CAD' | 'USD' | 'ETB',
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    fetchBriefs();
  }, []);

  const fetchBriefs = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/project-briefs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBriefs(response.data);
    } catch (error) {
      console.error('Failed to fetch briefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (briefId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!approveForm.approvedBudget || !approveForm.approvedDeadline) {
      alert('Please fill in budget and deadline');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/project-briefs/${briefId}/approve`,
        {
          approvedBudget: parseFloat(approveForm.approvedBudget),
          approvedCurrency: approveForm.approvedCurrency,
          approvedDeadline: approveForm.approvedDeadline,
          adminNotes: approveForm.adminNotes || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Brief approved! Project and invoice created.');
      setShowApproveModal(null);
      setApproveForm({ approvedBudget: '', approvedCurrency: 'CAD', approvedDeadline: '', adminNotes: '' });
      fetchBriefs();
    } catch (error: any) {
      console.error('Failed to approve brief:', error);
      alert(error.response?.data?.message || 'Failed to approve brief. Please try again.');
    }
  };

  const handleReject = async (briefId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!rejectForm.adminNotes) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/project-briefs/${briefId}/reject`,
        { adminNotes: rejectForm.adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Brief rejected.');
      setShowRejectModal(null);
      setRejectForm({ adminNotes: '' });
      fetchBriefs();
    } catch (error: any) {
      console.error('Failed to reject brief:', error);
      alert(error.response?.data?.message || 'Failed to reject brief. Please try again.');
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setSendingInvoice(invoiceId);
    try {
      await axios.post(
        `${API_URL}/invoices/${invoiceId}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Invoice sent successfully! Client will receive email with payment link.');
      fetchBriefs();
    } catch (error: any) {
      console.error('Failed to send invoice:', error);
      alert(error.response?.data?.message || 'Failed to send invoice. Please try again.');
    } finally {
      setSendingInvoice(null);
    }
  };

  const handleEditInvoice = async (invoiceId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!invoiceForm.amount || !invoiceForm.dueDate || !invoiceForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/invoices/${invoiceId}`,
        {
          amount: parseFloat(invoiceForm.amount),
          currency: invoiceForm.currency,
          dueDate: invoiceForm.dueDate,
          items: [
            {
              description: invoiceForm.description,
              quantity: 1,
              unitPrice: parseFloat(invoiceForm.amount),
              total: parseFloat(invoiceForm.amount),
            },
          ],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Invoice updated successfully!');
      setShowEditInvoiceModal(null);
      setInvoiceForm({ amount: '', currency: 'CAD', dueDate: '', description: '' });
      fetchBriefs();
    } catch (error: any) {
      console.error('Failed to edit invoice:', error);
      alert(error.response?.data?.message || 'Failed to edit invoice. Please try again.');
    }
  };

  const openApproveModal = (brief: ProjectBrief) => {
    // Pre-fill form with suggested values
    const suggestedBudget = brief.budgetRange
      ? parseFloat(brief.budgetRange.split('-')[0].replace(/[^0-9.]/g, ''))
      : 0;
    const suggestedDeadline = brief.timeline
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : '';

    setApproveForm({
      approvedBudget: suggestedBudget > 0 ? suggestedBudget.toString() : '',
      approvedCurrency: 'CAD',
      approvedDeadline: suggestedDeadline,
      adminNotes: '',
    });
    setShowApproveModal(brief.id);
  };

  const openEditInvoiceModal = (invoice: any) => {
    if (!invoice) return;
    setInvoiceForm({
      amount: invoice.amount?.toString() || '',
      currency: (invoice.currency as 'CAD' | 'USD' | 'ETB') || 'CAD',
      dueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toISOString().split('T')[0]
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: invoice.items?.[0]?.description || '',
    });
    setShowEditInvoiceModal(invoice.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getDraftInvoice = (brief: ProjectBrief) => {
    return brief.project?.invoices?.find((inv) => inv.status === 'DRAFT');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading briefs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Briefs</h1>
            <p className="text-gray-600 mt-1">Review and approve project briefs</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {briefs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Briefs Yet</h3>
              <p className="text-gray-600">Project briefs will appear here when clients submit requests.</p>
            </div>
          ) : (
            briefs.map((brief) => {
              const draftInvoice = getDraftInvoice(brief);
              const sentInvoice = brief.project?.invoices?.find((inv) => inv.status === 'SENT');

              return (
                <div key={brief.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(brief.status)}
                        <h3 className="text-xl font-semibold">{brief.projectType}</h3>
                      </div>
                      {brief.businessType && (
                        <p className="text-sm text-gray-600 mb-1">Business: {brief.businessType}</p>
                      )}
                      {brief.conversation?.user && (
                        <p className="text-sm text-gray-600">
                          Client: {brief.conversation.user.name} ({brief.conversation.user.email})
                        </p>
                      )}
                      {brief.budgetRange && (
                        <p className="text-sm text-gray-600">Suggested Budget: {brief.budgetRange}</p>
                      )}
                      {brief.timeline && (
                        <p className="text-sm text-gray-600">Timeline: {brief.timeline}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        brief.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : brief.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {brief.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{brief.summary}</p>

                  {brief.status === 'APPROVED' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {brief.approvedBudget && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Approved Budget</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {brief.approvedBudget.toLocaleString()} {brief.approvedCurrency}
                            </p>
                          </div>
                        )}
                        {brief.approvedDeadline && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Deadline</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {new Date(brief.approvedDeadline).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {brief.project && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Project Created</p>
                            <p className="text-lg font-semibold text-gray-900">✓ Yes</p>
                          </div>
                        )}
                      </div>

                      {draftInvoice && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Draft Invoice: {draftInvoice.invoiceNumber}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {draftInvoice.amount.toLocaleString()} {draftInvoice.currency}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditInvoiceModal(draftInvoice)}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleSendInvoice(draftInvoice.id)}
                                disabled={sendingInvoice === draftInvoice.id}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {sendingInvoice === draftInvoice.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-4 h-4" />
                                    Send Invoice
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {sentInvoice && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Invoice Sent: {sentInvoice.invoiceNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Client has been notified with payment link
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {brief.adminNotes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-600">{brief.adminNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {brief.status === 'PENDING_REVIEW' && (
                      <>
                        <button
                          onClick={() => openApproveModal(brief)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setShowRejectModal(brief.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Approve Brief</h2>
              <button
                onClick={() => setShowApproveModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Budget *
                </label>
                <input
                  type="number"
                  value={approveForm.approvedBudget}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, approvedBudget: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter budget"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <select
                  value={approveForm.approvedCurrency}
                  onChange={(e) =>
                    setApproveForm({
                      ...approveForm,
                      approvedCurrency: e.target.value as 'CAD' | 'USD' | 'ETB',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                  <option value="ETB">ETB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={approveForm.approvedDeadline}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, approvedDeadline: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={approveForm.adminNotes}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, adminNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any notes for the client..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowApproveModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(showApproveModal)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Reject Brief</h2>
              <button
                onClick={() => setShowRejectModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectForm.adminNotes}
                  onChange={(e) => setRejectForm({ adminNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Invoice</h2>
              <button
                onClick={() => setShowEditInvoiceModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <select
                  value={invoiceForm.currency}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      currency: e.target.value as 'CAD' | 'USD' | 'ETB',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                  <option value="ETB">ETB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditInvoiceModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditInvoice(showEditInvoiceModal)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
