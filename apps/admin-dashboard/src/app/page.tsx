'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  MessageSquare,
  Clock,
  ArrowRight,
  CreditCard,
  Activity,
  Target,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingBriefs: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  activeClients: number;
  activeConversations: number;
  overdueInvoices: number;
  recentPayments: any[];
  recentProjects: any[];
  revenueByMonth: Array<{ month: string; revenue: number }>;
  projectStatusBreakdown: Array<{ status: string; count: number }>;
  paymentStatusBreakdown: Array<{ status: string; count: number; amount: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingBriefs: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    activeClients: 0,
    activeConversations: 0,
    overdueInvoices: 0,
    recentPayments: [],
    recentProjects: [],
    revenueByMonth: [],
    projectStatusBreakdown: [],
    paymentStatusBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [projectsRes, briefsRes, conversationsRes, invoicesRes, paymentsRes] = await Promise.all([
          axios.get(`${API_URL}/projects`, { headers }),
          axios.get(`${API_URL}/project-briefs`, { headers }),
          axios.get(`${API_URL}/conversations/admin/all`, { headers }),
          axios.get(`${API_URL}/invoices`, { headers }),
          axios.get(`${API_URL}/payments/history`, { headers }),
        ]);

        const projects = projectsRes.data || [];
        const briefs = briefsRes.data || [];
        const conversations = conversationsRes.data || [];
        const invoices = invoicesRes.data || [];
        const payments = paymentsRes.data || [];

        // Calculate revenue by month
        const revenueByMonthMap = new Map<string, number>();
        payments
          .filter((p: any) => p.status === 'COMPLETED')
          .forEach((payment: any) => {
            const date = new Date(payment.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            revenueByMonthMap.set(monthKey, (revenueByMonthMap.get(monthKey) || 0) + payment.amount);
          });

        const revenueByMonth = Array.from(revenueByMonthMap.entries())
          .map(([key, revenue]) => ({
            month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short' }),
            revenue: Math.round(revenue),
          }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-6); // Last 6 months

        // Project status breakdown
        const statusCounts = new Map<string, number>();
        projects.forEach((p: any) => {
          statusCounts.set(p.status, (statusCounts.get(p.status) || 0) + 1);
        });
        const projectStatusBreakdown = Array.from(statusCounts.entries()).map(([status, count]) => ({
          status: status.replace('_', ' '),
          count,
        }));

        // Payment status breakdown
        const paymentStatusMap = new Map<string, { count: number; amount: number }>();
        payments.forEach((p: any) => {
          const existing = paymentStatusMap.get(p.status) || { count: 0, amount: 0 };
          paymentStatusMap.set(p.status, {
            count: existing.count + 1,
            amount: existing.amount + (p.status === 'COMPLETED' ? p.amount : 0),
          });
        });
        const paymentStatusBreakdown = Array.from(paymentStatusMap.entries()).map(([status, data]) => ({
          status,
          ...data,
        }));

        // Recent payments (last 5)
        const recentPayments = payments
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        // Recent projects (last 5)
        const recentProjects = projects
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        const activeProjects = projects.filter((p: any) =>
          ['IN_PROGRESS', 'REVIEW', 'PENDING_REVIEW'].includes(p.status)
        ).length;

        const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;

        const paidRevenue = payments
          .filter((p: any) => p.status === 'COMPLETED')
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        const pendingRevenue = invoices
          .filter((i: any) => ['SENT', 'OVERDUE'].includes(i.status))
          .reduce((sum: number, i: any) => sum + i.amount, 0);

        const overdueInvoices = invoices.filter(
          (i: any) => i.status === 'OVERDUE' || (new Date(i.dueDate) < new Date() && i.status !== 'PAID')
        ).length;

        setStats({
          totalProjects: projects.length,
          activeProjects,
          completedProjects,
          pendingBriefs: briefs.filter((b: any) => b.status === 'PENDING_REVIEW').length,
          totalRevenue: projects.reduce((sum: number, p: any) => sum + p.budget, 0),
          paidRevenue,
          pendingRevenue,
          activeClients: new Set(projects.map((p: any) => p.clientId)).size,
          activeConversations: conversations.filter((c: any) => c.status === 'ACTIVE').length,
          overdueInvoices,
          recentPayments,
          recentProjects,
          revenueByMonth,
          projectStatusBreakdown,
          paymentStatusBreakdown,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const revenueGrowth = stats.revenueByMonth.length >= 2
    ? ((stats.revenueByMonth[stats.revenueByMonth.length - 1].revenue -
        stats.revenueByMonth[stats.revenueByMonth.length - 2].revenue) /
        stats.revenueByMonth[stats.revenueByMonth.length - 2].revenue) *
      100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Business Dashboard</h1>
              <p className="text-gray-600">Overview of your business performance</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/briefs"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Review Briefs
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ${stats.paidRevenue.toLocaleString()} received
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.completedProjects} completed
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeClients}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.activeConversations} active conversations
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Pending Actions</p>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.pendingBriefs + stats.overdueInvoices}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.pendingBriefs} briefs, {stats.overdueInvoices} overdue
            </p>
          </div>
        </div>

        {/* Revenue & Payment Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-500">Last 6 months</p>
              </div>
              {revenueGrowth !== 0 && (
                <div className={`flex items-center gap-1 ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{Math.abs(revenueGrowth).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.paymentStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.paymentStatusBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Project Status Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.projectStatusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/briefs"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Review Briefs</span>
                </div>
                {stats.pendingBriefs > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {stats.pendingBriefs}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/conversations"
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">View Conversations</span>
                </div>
                {stats.activeConversations > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    {stats.activeConversations}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
              </Link>

              <Link
                href="/invoices"
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Manage Invoices</span>
                </div>
                {stats.overdueInvoices > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {stats.overdueInvoices}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-600" />
              </Link>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Revenue Goal</p>
                  <p className="text-sm opacity-90">
                    ${stats.paidRevenue.toLocaleString()} of ${stats.totalRevenue.toLocaleString()} collected
                  </p>
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{
                        width: `${(stats.paidRevenue / stats.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Pending Revenue</p>
                  <p className="text-2xl font-bold">${stats.pendingRevenue.toLocaleString()}</p>
                  <p className="text-sm opacity-90">Awaiting payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
              <Link
                href="/payments"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentPayments.length > 0 ? (
                stats.recentPayments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          ${payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent payments</p>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <Link
                href="/projects"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentProjects.length > 0 ? (
                stats.recentProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-500">
                          ${project.budget.toLocaleString()} • {project.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent projects</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
