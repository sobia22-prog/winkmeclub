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
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" />
            {isStaff ? `${user?.fullName || 'Staff'} — Client Command Center` : 'Platform Admin Dashboard'}
          </h1>
          <p className="text-xs text-slate-400">
            {isStaff
              ? 'Real-time metrics, client user activity, revenue, and transaction history for your assigned clients.'
              : 'Real-time system statistics, overall user growth, and platform revenue metrics.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isStaff && (
            <Link to="/admin/settings">
              <Button variant="secondary" size="sm" leftIcon={<Settings className="w-4 h-4 text-amber-400" />}>
                Payment Settings
              </Button>
            </Link>
          )}
          <Link to="/admin/profile">
            <Button variant="gold" size="sm" leftIcon={<UserIcon className="w-4 h-4" />}>
              Profile Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards (Total Users, Active Users, Girls Profiles, Revenue) */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={isStaff ? 'My Total Clients' : 'Total Registered Users'}
            value={stats.totalUsers || 0}
            subtitle={isStaff ? 'Assigned client accounts' : `${stats.activeUsers || 0} Active • ${stats.vipUsers || 0} VIP Members`}
            icon={<Users className="w-5 h-5 text-amber-400" />}
          />
          <StatCard
            title={isStaff ? 'My Active Clients' : 'Active System Users'}
            value={stats.activeUsers || 0}
            subtitle="Active accounts in good standing"
            icon={<UserCheck className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            title="Girls Profiles"
            value={stats.girlsProfiles || 0}
            subtitle="Curated match catalog"
            icon={<Sparkles className="w-5 h-5 text-pink-400" />}
          />
          <StatCard
            title={isStaff ? 'Client Revenue' : 'Total Revenue'}
            value={`${currencySymbol}${(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle="From approved deposit recharges"
            icon={<DollarSign className="w-5 h-5 text-purple-400" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-28 bg-slate-800/50">
              <div className="h-full w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* 2 CHARTS SIDE-BY-SIDE ON THE SAME LINE (Line Chart 2/3 width, Bar Chart 1/3 width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Chart 1: Revenue & Growth (Line Chart - 2/3 Width) */}
        <Card className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Revenue & Growth
              </h3>
              <p className="text-xs text-slate-400">Monthly revenue trend across the year</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] rounded-lg">
              Yearly Revenue
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131722', borderColor: '#2a3142', borderRadius: '12px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: New Users (Bar Chart - 1/3 Width) */}
        <Card className="lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" /> New Users
              </h3>
              <p className="text-xs text-slate-400">Monthly new user acquisition</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px] rounded-lg">
              User Signups
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131722', borderColor: '#2a3142', borderRadius: '12px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(val: any) => [val, 'New Users']}
                />
                <Bar dataKey="NewUsers" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h3 className="text-base font-bold text-slate-100">
            {isStaff ? 'Recent Client Transactions' : 'Recent System Transactions'}
          </h3>
          <span className="text-xs text-slate-400">Latest 8 entries</span>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">No recent transactions recorded for your clients.</p>
        ) : (
          <Table headers={['Transaction ID', 'Client Name', 'Type', 'Amount', 'Description', 'Date']}>
            {recentTransactions.map((tx) => (
              <tr key={tx._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{tx.transactionId}</td>
                <td className="px-5 py-3 text-slate-200 font-semibold">
                  {tx.userId && typeof tx.userId === 'object' ? (tx.userId as any).fullName : 'User / Deleted'}
                </td>
                <td className="px-5 py-3">
                  <Badge variant="neutral" size="sm">
                    {tx.type}
                  </Badge>
                </td>
                <td className="px-5 py-3 font-bold text-amber-400">
                  {currencySymbol}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 text-xs text-slate-400 max-w-xs truncate">{tx.description}</td>
                <td className="px-5 py-3 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};
