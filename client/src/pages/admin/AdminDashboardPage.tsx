import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import {
  Users,
  DollarSign,
  Wallet,
  ShieldAlert,
  TrendingUp,
  Activity,
  Settings,
  User,
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
    <div className="space-y-8 w-full">
      {/* Header with Direct Navigation Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" /> Platform Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400">Real-time system statistics, user growth, & revenue metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/settings">
            <Button variant="secondary" size="sm" leftIcon={<Settings className="w-4 h-4 text-amber-400" />}>
              Payment Settings
            </Button>
          </Link>
          <Link to="/admin/profile">
            <Button variant="gold" size="sm" leftIcon={<User className="w-4 h-4" />}>
              Admin Profile
            </Button>
          </Link>
        </div>
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
            icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            title="User Available Vault"
            value={`₹${stats.totalAvailableFunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle={`₹${stats.totalFrozenFunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Frozen Hold`}
            icon={<Wallet className="w-5 h-5 text-purple-400" />}
          />
          <StatCard
            title="Action Queue Items"
            value={stats.pendingTradesCount + stats.pendingRechargesCount + stats.pendingWithdrawalsCount + stats.pendingVerificationsCount}
            subtitle={`${stats.pendingRechargesCount} Recharge • ${stats.pendingWithdrawalsCount} Payout`}
            icon={<ShieldAlert className="w-5 h-5 text-rose-400" />}
          />
        </div>
      )}

      {/* Revenue & Trade Volume Line Chart */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" /> Platform Revenue & Trade Activity Trends
            </h3>
            <p className="text-xs text-slate-400">Daily approved add-funds recharge revenue vs settled trade volume</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueGrowth && revenueGrowth.length > 0 ? revenueGrowth : [
              { name: 'Mon', Revenue: 15000, TradeVolume: 8000 },
              { name: 'Tue', Revenue: 22000, TradeVolume: 12000 },
              { name: 'Wed', Revenue: 18000, TradeVolume: 15000 },
              { name: 'Thu', Revenue: 35000, TradeVolume: 24000 },
              { name: 'Fri', Revenue: 42000, TradeVolume: 30000 },
              { name: 'Sat', Revenue: 60000, TradeVolume: 45000 },
              { name: 'Sun', Revenue: 80000, TradeVolume: 55000 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#131722', borderColor: '#2a3142', borderRadius: '12px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="TradeVolume" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Ledger Activity Table */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-100">Live System Transaction Ledger</h3>

        {recentTransactions.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">No recent transactions recorded.</p>
        ) : (
          <Table headers={['Transaction ID', 'User', 'Type', 'Amount', 'Description', 'Timestamp']}>
            {recentTransactions.map((tx) => (
              <tr key={tx._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{tx.transactionId}</td>
                <td className="px-5 py-3 text-slate-300">
                  {tx.userId && typeof tx.userId === 'object' ? (tx.userId as any).fullName : 'User / Deleted Account'}
                </td>
                <td className="px-5 py-3">
                  <Badge variant="neutral" size="sm">
                    {tx.type}
                  </Badge>
                </td>
                <td className="px-5 py-3 font-bold text-amber-400">
                  ₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
