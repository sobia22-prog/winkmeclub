import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import {
  Users,
  Crown,
  DollarSign,
  Wallet,
  ShoppingBag,
  ArrowUpRight,
  ShieldAlert,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
          setRevenueGrowth(res.data.revenueGrowth);
          setRecentTransactions(res.data.recentTransactions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-400" /> Platform Admin Dashboard
        </h1>
        <p className="text-xs text-slate-400">Real-time system statistics, user growth, & revenue metrics.</p>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Users"
            value={stats.totalUsers}
            subtitle={`${stats.activeUsers} Active • ${stats.vipUsers} VIP Members`}
            icon={<Users className="w-5 h-5 text-amber-400" />}
          />
          <StatCard
            title="Total Platform Revenue"
            value={`₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle="From approved recharges"
            icon={<DollarSign className="w-5 h-5 font-bold text-emerald-400" />}
          />
          <StatCard
            title="Available User Funds"
            value={`₹${stats.totalAvailableFunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle="Total available balances"
            icon={<Wallet className="w-5 h-5 text-purple-400" />}
          />
          <StatCard
            title="Frozen User Holdings"
            value={`₹${stats.totalFrozenFunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle="Locked in active positions"
            icon={<ShoppingBag className="w-5 h-5 text-amber-400" />}
          />
        </div>
      )}

      {/* Pending Items Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Trades</span>
            <span className="text-lg font-bold text-amber-400">{stats.pendingTradesCount}</span>
          </div>
          <div className="p-4 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Recharges</span>
            <span className="text-lg font-bold text-emerald-400">{stats.pendingRechargesCount}</span>
          </div>
          <div className="p-4 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Withdrawals</span>
            <span className="text-lg font-bold text-rose-400">{stats.pendingWithdrawalsCount}</span>
          </div>
          <div className="p-4 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Verifications</span>
            <span className="text-lg font-bold text-purple-400">{stats.pendingVerificationsCount}</span>
          </div>
        </div>
      )}

      {/* Recharts Analytics Chart */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" /> Revenue & Trade Volume Activity (7-Day Trend)
        </h3>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#131722', borderColor: '#2a3142', borderRadius: '12px', color: '#f8fafc' }}
              />
              <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="TradeVolume" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Platform Transactions */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100">Recent Platform Transactions</h3>

        {recentTransactions.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">No transactions recorded yet.</Card>
        ) : (
          <Table headers={['Tx ID', 'User', 'Type', 'Amount', 'Description', 'Timestamp']}>
            {recentTransactions.map((tx) => (
              <tr key={tx._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{tx.transactionId}</td>
                <td className="px-5 py-3 font-semibold text-slate-200">{tx.userId?.fullName || 'User'}</td>
                <td className="px-5 py-3">
                  <Badge variant="neutral" size="sm">
                    {tx.type}
                  </Badge>
                </td>
                <td className="px-5 py-3 font-bold text-amber-400">
                  ₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 text-xs text-slate-300 max-w-xs truncate">{tx.description}</td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};
