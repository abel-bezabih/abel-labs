'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';
import { ArrowRight, FileText, DollarSign, Clock, TrendingUp, CheckCircle2, AlertCircle, Loader2, Receipt, XCircle, History, Download } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Project {
  id: string;
  title: string;
  status: string;
  budget: number;
  currency: string;
  deadline?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt?: string;
  project: {
    id: string;
    title: string;
  };
  payments: Array<{
    id: string;
    status: string;
    amount: number;
  }>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      setInvoicesLoading(false);
      return;
    }

    // Fetch projects
    axios
      .get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const projectsData = response.data;
        setProjects(projectsData);
        setStats({
          total: projectsData.length,
          active: projectsData.filter((p: Project) => p.status === 'IN_PROGRESS').length,
          completed: projectsData.filter((p: Project) => p.status === 'COMPLETED').length,
          totalValue: projectsData.reduce((sum: number, p: Project) => sum + p.budget, 0),
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch projects:', error);
        setLoading(false);
      });

    // Fetch invoices
    axios
      .get(`${API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setInvoices(response.data || []);
        setInvoicesLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch invoices:', error);
        setInvoicesLoading(false);
      });
  }, []);

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
          <p className="text-gray-600">Loading your projects...</p>
        </motion.div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'SENT':
        return 'bg-blue-100 text-blue-700';
      case 'OVERDUE':
        return 'bg-red-100 text-red-700';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getInvoiceStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'OVERDUE':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const isInvoiceOverdue = (invoice: Invoice) => {
    if (invoice.status === 'PAID') return false;
    const dueDate = new Date(invoice.dueDate);
    return dueDate < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: 'Total Projects',
              value: stats.total,
              icon: FileText,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              label: 'Active Projects',
              value: stats.active,
              icon: Clock,
              color: 'from-purple-500 to-pink-500',
            },
            {
              label: 'Completed',
              value: stats.completed,
              icon: CheckCircle2,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Total Investment',
              value: `$${stats.totalValue.toLocaleString()} CAD`,
              icon: DollarSign,
              color: 'from-orange-500 to-red-500',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Your Projects</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4 text-lg">No projects yet</p>
                <Link href="/chat">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    Start a new project
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </div>
            ) : (
              projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">{project.title}</h3>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {getStatusIcon(project.status)}
                          {project.status.replace('_', ' ')}
                        </span>
                        {project.deadline && (
                          <span className="text-sm text-gray-600">
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-xl text-gray-900 mb-1">
                        {project.budget.toLocaleString()} {project.currency}
                      </p>
                      <Link href={`/projects/${project.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Invoices List */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mt-8"
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Invoices</h2>
            <Link
              href="/payment-history"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
            >
              <History className="w-4 h-4" />
              Payment History
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {invoicesLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2 text-lg font-medium">No invoices yet</p>
                <p className="text-sm text-gray-400 mb-4">Invoices will appear here once they are created for your projects</p>
                <Link href="/chat">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                  >
                    Start a Project
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
              </div>
            ) : (
              invoices.map((invoice, idx) => {
                const overdue = isInvoiceOverdue(invoice);
                const displayStatus = overdue ? 'OVERDUE' : invoice.status;
                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{invoice.invoiceNumber}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getInvoiceStatusColor(
                              displayStatus
                            )}`}
                          >
                            {getInvoiceStatusIcon(displayStatus)}
                            {displayStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Project: {invoice.project.title}</p>
                        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600">
                          <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                          {invoice.paidAt && (
                            <span className="text-green-600">Paid: {new Date(invoice.paidAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-xl text-gray-900 mb-2">
                          {invoice.amount.toLocaleString()} {invoice.currency}
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={`${API_URL}/invoices/${invoice.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </a>
                          {invoice.status !== 'PAID' && (
                            <Link href={`/payment?invoiceId=${invoice.id}`}>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                              >
                                <DollarSign className="w-4 h-4" />
                                Pay Now
                              </motion.div>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
