import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import {
  Users,
  DollarSign,
  Activity,
  Settings,
  User as UserIcon,
  Sparkles,
  TrendingUp,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSystemSettings();
  const [stats, setStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isStaff = user?.role === 'STAFF';
  const currencySymbol = settings.currencySymbol || '₹';

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
          setMonthlyData(res.data.monthlyData || res.data.revenueGrowth || []);
          setRecentTransactions(res.data.recentTransactions || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fallbackMonthlyData = [
    { name: 'Jan', Revenue: 15000, NewUsers: 4 },
    { name: 'Feb', Revenue: 22000, NewUsers: 7 },
    { name: 'Mar', Revenue: 18000, NewUsers: 5 },
    { name: 'Apr', Revenue: 35000, NewUsers: 12 },
    { name: 'May', Revenue: 42000, NewUsers: 15 },
    { name: 'Jun', Revenue: 60000, NewUsers: 22 },
    { name: 'Jul', Revenue: 80000, NewUsers: 30 },
    { name: 'Aug', Revenue: 95000, NewUsers: 35 },
    { name: 'Sep', Revenue: 70000, NewUsers: 25 },
    { name: 'Oct', Revenue: 85000, NewUsers: 28 },
    { name: 'Nov', Revenue: 90000, NewUsers: 32 },
    { name: 'Dec', Revenue: 110000, NewUsers: 40 },
  ];

  const chartData = monthlyData && monthlyData.length > 0 ? monthlyData : fallbackMonthlyData;

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-pink-600" />
            {isStaff ? `${user?.fullName || 'Staff'} — Client Command Center` : 'Platform Admin Dashboard'}
          </h1>
          <p className="text-xs text-slate-500">
            {isStaff
              ? 'Real-time metrics, client user activity, revenue, and transaction history for your assigned clients.'
              : 'Real-time system statistics, overall user growth, and platform revenue metrics.'}
          </p>
        </div>

        {!isStaff && (
          <div className="flex items-center gap-3">
            <Link to="/admin/profile">
              <Button variant="primary" size="sm" leftIcon={<UserIcon className="w-4 h-4" />}>
                Profile Settings
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 4 KPI Cards */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={isStaff ? 'My Total Clients' : 'Total Registered Users'}
            value={stats.totalUsers || 0}
            subtitle={isStaff ? 'Assigned client accounts' : `${stats.activeUsers || 0} Active • ${stats.vipUsers || 0} VIP Members`}
            icon={<Users className="w-5 h-5 text-pink-600" />}
          />
          <StatCard
            title={isStaff ? 'My Active Clients' : 'Active System Users'}
            value={stats.activeUsers || 0}
            subtitle="Active accounts in good standing"
            icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Girls Profiles"
            value={stats.girlsProfiles || 0}
            subtitle="Curated match catalog"
            icon={<Sparkles className="w-5 h-5 text-purple-600" />}
          />
          <StatCard
            title={isStaff ? 'Client Revenue' : 'Total Revenue'}
            value={`${currencySymbol}${(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle="From approved deposit recharges"
            icon={<DollarSign className="w-5 h-5 text-pink-600" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-28 bg-slate-100">
              <div className="h-full w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* 2 CHARTS SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Chart 1: Revenue & Growth */}
        <Card className="lg:col-span-2 space-y-4 flex flex-col justify-between bg-white border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Revenue & Growth
              </h3>
              <p className="text-xs text-slate-500">Monthly revenue trend across the year</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] rounded-lg">
              Yearly Revenue
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ec4899' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: New Users */}
        <Card className="lg:col-span-1 space-y-4 flex flex-col justify-between bg-white border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-600" /> New Users
              </h3>
              <p className="text-xs text-slate-500">Monthly new user acquisition</p>
            </div>
            <span className="px-2.5 py-1 bg-pink-50 border border-pink-200 text-pink-700 font-bold text-[11px] rounded-lg">
              User Signups
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  formatter={(val: any) => [val, 'New Users']}
                />
                <Bar dataKey="NewUsers" fill="#9333ea" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="space-y-4 bg-white border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            {isStaff ? 'Recent Client Transactions' : 'Recent System Transactions'}
          </h3>
          <span className="text-xs text-slate-500">Latest 8 entries</span>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">No recent transactions recorded for your clients.</p>
        ) : (
          <div className="w-full overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
            <Table headers={['Transaction ID', 'Client Name', 'Type', 'Amount', 'Description', 'Date']}>
              {recentTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">{tx.transactionId}</td>
                  <td className="px-5 py-3 text-slate-800 font-semibold">
                    {tx.userId && typeof tx.userId === 'object' ? (tx.userId as any).fullName : 'User / Deleted'}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="neutral" size="sm">
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 font-bold text-pink-600">
                    {currencySymbol}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600 max-w-xs truncate">{tx.description}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
