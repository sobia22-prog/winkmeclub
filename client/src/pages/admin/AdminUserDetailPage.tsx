import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { useRealtimeEvent } from '../../contexts/SocketContext';
import { ArrowLeft, User, Wallet, History, ShieldCheck, KeyRound, Lock, Activity, TrendingUp } from 'lucide-react';

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = useSystemSettings();
  const { user: currentUser } = useAuth();
  const isStaff = currentUser?.role === 'STAFF';
  const usersListPath = isStaff ? '/staff/users' : '/admin/users';
  const currencySymbol = settings.currencySymbol || '₹';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserDetail = async () => {
    if (!id) return;
    try {
      const res = await adminService.getUserDetail(id);
      if (res.data.success) {
        setData(res.data.data || res.data);
      }
    } catch (err: any) {
      console.error(err);
      if (!data) {
        setError(err.response?.data?.message || 'Failed to fetch user details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Real-time WebSocket event triggers for instant zero-lag updates
  useRealtimeEvent('trade:created', () => fetchUserDetail());
  useRealtimeEvent('trade:settled', () => fetchUserDetail());
  useRealtimeEvent('balance:updated', () => fetchUserDetail());
  useRealtimeEvent('recharge:updated', () => fetchUserDetail());
  useRealtimeEvent('withdrawal:updated', () => fetchUserDetail());
  useRealtimeEvent('user:updated', () => fetchUserDetail());
  useRealtimeEvent('data:invalidate', () => fetchUserDetail());

  useEffect(() => {
    fetchUserDetail();

    let isMounted = true;
    let pollTimer: NodeJS.Timeout;

    const poll = async () => {
      await fetchUserDetail();
      if (isMounted) {
        pollTimer = setTimeout(poll, 2000);
      }
    };
    poll();

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchUserDetail();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      clearTimeout(pollTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [id]);

  if (loading) return <Card className="p-8 text-center text-xs text-slate-500">Loading user details...</Card>;
  if (error || !data || !data.user) {
    return (
      <div className="space-y-4">
        <Link to={usersListPath} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" /> Back to User Directory
        </Link>
        <Card className="p-8 text-center text-xs text-rose-600 bg-rose-50 border border-rose-200">
          {error || 'User profile not found.'}
        </Card>
      </div>
    );
  }

  const { user, wallet = { availableBalance: 0, frozenBalance: 0, totalBalance: 0 }, transactions = [], recharges = [], withdrawals = [], trades = [] } = data;

  const totalBal = wallet.totalBalance ?? (wallet.availableBalance + wallet.frozenBalance);
  const availBal = wallet.availableBalance ?? 0;
  const frozBal = wallet.frozenBalance ?? 0;

  const userStatus = user.status === 'SUSPENDED' ? 'BLOCKED' : (user.status || 'ACTIVE');

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link to={usersListPath} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-pink-600" /> {user.fullName}
          </h1>
          <p className="text-xs text-slate-500">{user.email} • ID: {user._id || user.id}</p>
        </div>
      </div>

      {/* Main Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile & Account Settings */}
        <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
              alt={user.fullName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{user.fullName}</h3>
              <p className="text-xs text-slate-500">📍 {user.city || 'Mumbai'} • {user.gender || 'Female'}</p>
              <div className="flex items-center gap-2 pt-1.5">
                {userStatus === 'ACTIVE' && <Badge variant="verified">ACTIVE</Badge>}
                {userStatus === 'BLOCKED' && <Badge variant="danger">BLOCKED</Badge>}
                {userStatus === 'PENDING' && <Badge variant="warning">PENDING</Badge>}
                {user.isVIP ? <Badge variant="vip">VIP</Badge> : <Badge variant="neutral">NONE</Badge>}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Credit Score</span>
              <span className="font-bold text-pink-600">{user.creditScore ?? 100} / 100</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Allow Withdraw</span>
              <span className={`font-bold ${user.allowWithdraw !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
                {user.allowWithdraw !== false ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Allow Trade</span>
              <span className={`font-bold ${user.allowTrade !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
                {user.allowTrade !== false ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Transaction PIN</span>
              <span className="font-bold text-slate-900">
                {user.hasTransactionPin || user.transactionPinHash ? (
                  <span className="text-emerald-600 font-bold">Set</span>
                ) : (
                  <span className="text-slate-400">Not set</span>
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Right Column: Wallet Balances & Quick Financial Summary */}
        <Card className="lg:col-span-2 space-y-4 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wallet className="w-4 h-4 text-emerald-600" /> Wallet Balance Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Balance</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {currencySymbol}{totalBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-700 block uppercase font-semibold">Available Balance (auto)</span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                {currencySymbol}{availBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 space-y-1">
              <span className="text-[10px] text-pink-700 block uppercase font-semibold">Frozen Balance</span>
              <span className="text-xl font-black text-pink-700 font-mono">
                {currencySymbol}{frozBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* User Ledger History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-pink-600" /> Recent User Transactions
        </h3>
        {transactions.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500 bg-white border border-slate-200 shadow-sm">No transactions recorded for this client.</Card>
        ) : (
          <Table headers={['Tx ID', 'Type', 'Amount', 'Before', 'After', 'Description', 'Date']}>
            {transactions.map((tx: any) => (
              <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-slate-900">{tx.transactionId}</td>
                <td className="px-4 py-2.5 text-xs text-slate-800 font-semibold">{tx.type}</td>
                <td className="px-4 py-2.5 font-bold text-pink-600 text-xs">
                  {currencySymbol}{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-600 font-mono">
                  {currencySymbol}{(tx.beforeBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-900 font-mono font-bold">
                  {currencySymbol}{(tx.afterBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-600 max-w-xs truncate">{tx.description}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Client Trade History Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-pink-600" /> Client Airborne Trade History
        </h3>
        {trades.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500 bg-white border border-slate-200 shadow-sm">No trades placed by this client yet.</Card>
        ) : (
          <Table headers={['Trade ID', 'Product', 'Qty / Amount', 'Status', 'Outcome & Profit', 'Date']}>
            {trades.map((t: any) => {
              const isWin = t.outcome === 'WIN';
              const isLose = t.outcome === 'LOSE';
              const profitPct = t.profitPercentage || 20;

              return (
                <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-bold text-xs text-slate-900">{t.tradeId}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-800 font-semibold">{t.productName}</td>
                  <td className="px-4 py-2.5 font-bold text-pink-600 text-xs">
                    {currencySymbol}{t.totalAmount || t.quantity || 0}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {t.status === 'PENDING' ? <Badge variant="pending">PENDING</Badge> : <Badge variant="verified">SETTLED</Badge>}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {isWin && <Badge variant="vip">WIN (+{profitPct}%)</Badge>}
                    {isLose && <Badge variant="danger">LOSE (-100%)</Badge>}
                    {!isWin && !isLose && <span className="text-[11px] text-slate-500 font-semibold">In Round</span>}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </div>
  );
};
