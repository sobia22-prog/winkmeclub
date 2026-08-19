import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
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
  Settings,
  Lock,
  User,
  Mail,
  CheckCircle2,
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
  const { user: adminUser, wallet: adminWallet, refreshSession } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Self-Management Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    fullName: adminUser?.fullName || 'System Administrator',
    email: adminUser?.email || 'admin@winkmedatingclub.com',
    password: '',
    balance: adminWallet?.availableBalance || 50000,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleOpenSettings = () => {
    setSettingsForm({
      fullName: adminUser?.fullName || 'System Administrator',
      email: adminUser?.email || 'admin@winkmedatingclub.com',
      password: '',
      balance: adminWallet?.availableBalance || 50000,
    });
    setShowSettingsModal(true);
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setMessage('');

    try {
      const res = await adminService.updateAdminSettings(settingsForm);
      if (res.data.success) {
        setMessage('Admin credentials & wallet balance updated successfully!');
        setShowSettingsModal(false);
        refreshSession();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update admin settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Admin Total Access Control Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" /> Platform Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400">Real-time system statistics, user growth, & revenue metrics.</p>
        </div>

        <Button
          variant="gold"
          size="sm"
          leftIcon={<Settings className="w-4 h-4" />}
          onClick={handleOpenSettings}
        >
          Admin Settings & Total Access Controls
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

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
            <LineChart data={revenueGrowth}>
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
                  {typeof tx.userId === 'object' ? tx.userId.fullName : 'User'}
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

      {/* Admin Total Access Settings Modal */}
      {showSettingsModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowSettingsModal(false)}
          title="Admin Total Access Controls & Settings"
        >
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
              Update your administrator login credentials, username, password, or wallet balance below.
            </div>

            <Input
              label="Admin Username / Full Name"
              value={settingsForm.fullName}
              onChange={(e) => setSettingsForm({ ...settingsForm, fullName: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Admin Email Address"
              type="email"
              value={settingsForm.email}
              onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="New Admin Password (leave blank to keep unchanged)"
              type="password"
              placeholder="Enter new password..."
              value={settingsForm.password}
              onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Admin Wallet Balance (₹)"
              type="number"
              value={settingsForm.balance}
              onChange={(e) => setSettingsForm({ ...settingsForm, balance: Number(e.target.value) })}
              leftIcon={<DollarSign className="w-4 h-4" />}
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <Button variant="secondary" onClick={() => setShowSettingsModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" isLoading={settingsLoading}>
                Save Admin Settings
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
