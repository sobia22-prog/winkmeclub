import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { ArrowLeft, User, Wallet, History, ShieldCheck, KeyRound, Lock, Activity } from 'lucide-react';

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminService
        .getUserDetail(id)
        .then((res) => {
          if (res.data.success) {
            setData(res.data.data || res.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Card className="p-8 text-center text-xs text-slate-500">Loading user details...</Card>;
  if (!data || !data.user) return <Card className="p-8 text-center text-xs text-slate-500">User not found.</Card>;

  const { user, wallet = { availableBalance: 0, frozenBalance: 0, totalBalance: 0 }, transactions = [], recharges = [], withdrawals = [], trades = [] } = data;

  const totalBal = wallet.totalBalance ?? (wallet.availableBalance + wallet.frozenBalance);
  const availBal = wallet.availableBalance ?? 0;
  const frozBal = wallet.frozenBalance ?? 0;

  const userStatus = user.status === 'SUSPENDED' ? 'BLOCKED' : (user.status || 'ACTIVE');

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/users" className="p-2.5 bg-brand-surface border border-brand-border rounded-xl text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" /> {user.fullName}
          </h1>
          <p className="text-xs text-slate-400">{user.email} • ID: {user._id || user.id}</p>
        </div>
      </div>

      {/* Main Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile & Account Settings */}
        <Card className="space-y-4">
          <div className="flex items-center gap-4 border-b border-brand-border pb-4">
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
              alt={user.fullName}
              className="w-16 h-16 rounded-2xl object-cover border border-brand-border"
            />
            <div>
              <h3 className="text-base font-bold text-slate-100">{user.fullName}</h3>
              <p className="text-xs text-slate-400">📍 {user.city || 'Mumbai'} • {user.gender || 'Female'}</p>
              <div className="flex items-center gap-2 pt-1.5">
                {userStatus === 'ACTIVE' && <Badge variant="verified">ACTIVE</Badge>}
                {userStatus === 'BLOCKED' && <Badge variant="danger">BLOCKED</Badge>}
                {userStatus === 'PENDING' && <Badge variant="warning">PENDING</Badge>}
                {user.isVIP ? <Badge variant="vip">VIP</Badge> : <Badge variant="neutral">NONE</Badge>}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-brand-border/40">
              <span className="text-slate-400">Credit Score</span>
              <span className="font-bold text-amber-400">{user.creditScore ?? 100} / 100</span>
            </div>

            <div className="flex justify-between py-1 border-b border-brand-border/40">
              <span className="text-slate-400">Allow Withdraw</span>
              <span className={`font-bold ${user.allowWithdraw !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                {user.allowWithdraw !== false ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-brand-border/40">
              <span className="text-slate-400">Allow Trade</span>
              <span className={`font-bold ${user.allowTrade !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                {user.allowTrade !== false ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-brand-border/40">
              <span className="text-slate-400">Transaction PIN</span>
              <span className="font-bold text-slate-200">
                {user.hasTransactionPin || user.transactionPinHash ? (
                  <span className="text-emerald-400 font-bold">Set</span>
                ) : (
                  <span className="text-slate-500">Not set</span>
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Right Column: Wallet Balances & Quick Financial Summary */}
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-brand-border pb-3">
            <Wallet className="w-4 h-4 text-emerald-400" /> Wallet Balance Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-brand-card rounded-2xl border border-brand-border space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Balance</span>
              <span className="text-xl font-black text-slate-100 font-mono">
                {currencySymbol}{totalBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-4 bg-brand-card rounded-2xl border border-emerald-500/30 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Available Balance (auto)</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {currencySymbol}{availBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-4 bg-brand-card rounded-2xl border border-amber-500/30 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Frozen Balance</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {currencySymbol}{frozBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* User Ledger History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" /> Recent User Transactions
        </h3>
        {transactions.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500">No transactions recorded for this client.</Card>
        ) : (
          <Table headers={['Tx ID', 'Type', 'Amount', 'Before', 'After', 'Description', 'Date']}>
            {transactions.map((tx: any) => (
              <tr key={tx._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-slate-200">{tx.transactionId}</td>
                <td className="px-4 py-2.5 text-xs text-slate-300 font-semibold">{tx.type}</td>
                <td className="px-4 py-2.5 font-bold text-amber-400 text-xs">
                  {currencySymbol}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">
                  {currencySymbol}{(tx.beforeBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-200 font-mono font-bold">
                  {currencySymbol}{(tx.afterBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-400 max-w-xs truncate">{tx.description}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};
