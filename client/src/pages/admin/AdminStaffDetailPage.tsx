import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import {
  Users,
  ArrowLeft,
  Key,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  History,
  Eye,
  CheckCircle2,
  AlertCircle,
  Activity,
  UserCheck,
  X,
  Clock,
  ExternalLink,
  Lock,
  Wallet,
  ShoppingBag,
  Package,
  Award,
  BarChart3,
} from 'lucide-react';

export const AdminStaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'clients' | 'trades' | 'recharges' | 'withdrawals' | 'transactions'>('clients');

  // Selected Client Summary Modal State
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const fetchStaffDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminService.getStaffDetail(id);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load staff member details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading staff profile & client operations ledger...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/staff')}>
          Back to Staff List
        </Button>
        <Card className="p-8 text-center text-xs text-rose-400 border border-rose-500/30">
          {error || 'Staff member profile not found.'}
        </Card>
      </div>
    );
  }

  const { staff = {}, stats = {}, clients = [], trades = [], recharges = [], withdrawals = [], transactions = [] } = data || {};

  // Filter trades, recharges, withdrawals, transactions specifically for selected client in modal
  const getClientData = (clientId: string) => {
    const clientTrades = trades.filter((t: any) => {
      const uId = typeof t.userId === 'object' ? t.userId?._id || t.userId?.id : t.userId;
      return String(uId) === String(clientId);
    });
    const clientRecharges = recharges.filter((r: any) => {
      const uId = typeof r.userId === 'object' ? r.userId?._id || r.userId?.id : r.userId;
      return String(uId) === String(clientId);
    });
    const clientWithdrawals = withdrawals.filter((w: any) => {
      const uId = typeof w.userId === 'object' ? w.userId?._id || w.userId?.id : w.userId;
      return String(uId) === String(clientId);
    });
    const clientTransactions = transactions.filter((tx: any) => {
      const uId = typeof tx.userId === 'object' ? tx.userId?._id || tx.userId?.id : tx.userId;
      return String(uId) === String(clientId);
    });

    return { clientTrades, clientRecharges, clientWithdrawals, clientTransactions };
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/staff')}>
          Back to Staff Directory
        </Button>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-pink-50 border border-pink-200 rounded-full font-mono text-xs font-bold text-pink-700 shadow-sm">
          <Key className="w-3.5 h-3.5 text-pink-600" /> Code: {staff.invitationCode || 'N/A'}
        </div>
      </div>

      {/* Staff Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-pink-50 border-2 border-pink-200 text-pink-600 flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              {staff.fullName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{staff.fullName || 'Staff Member'}</h1>
                {staff.status === 'ACTIVE' ? <Badge variant="verified">ACTIVE STAFF</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {staff.email} {staff.phone ? `• ${staff.phone}` : ''}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Joined: {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <StatCard
            title="Assigned Clients"
            value={stats.clientCount}
            subtitle="Directly linked members"
            icon={<Users className="w-5 h-5 text-pink-600" />}
          />
          <StatCard
            title="Total Client Revenue"
            value={`${currencySymbol}${(stats.totalApprovedRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subtitle="From approved deposits"
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Client Trade Volume"
            value={`${currencySymbol}${(stats.totalTradeVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subtitle="Across settled trades"
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          />
          <StatCard
            title="Total Trade Orders"
            value={stats.tradesCount}
            subtitle="Executed trade orders"
            icon={<Activity className="w-5 h-5 text-sky-600" />}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Associated Clients ({clients.length})
        </button>

        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'trades'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> All Client Trades ({trades.length})
        </button>

        <button
          onClick={() => setActiveTab('recharges')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recharges'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" /> Recharges ({recharges.length})
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'withdrawals'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Withdrawals ({withdrawals.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" /> Transaction Ledger ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Associated Clients with In-Page Quick Summary Modal trigger */}
      {activeTab === 'clients' && (
        <div className="w-full overflow-x-auto">
          {clients.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">
              No clients have registered with this staff member's invitation code (`{staff.invitationCode}`) yet.
            </Card>
          ) : (
            <Table headers={['Client Name & Email', 'City', 'Status', 'VIP Status', 'Available Balance', 'Frozen Balance', 'Action']}>
              {clients.map((c: any) => (
                <tr key={c._id || c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                        alt={c.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{c.fullName}</div>
                        <div className="text-[11px] text-slate-500">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-700 font-medium">{c.city || 'Mumbai'}</td>
                  <td className="px-5 py-3">
                    {c.status === 'ACTIVE' ? <Badge variant="verified">ACTIVE</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    {c.isVIP ? <Badge variant="vip">VIP CLUB</Badge> : <Badge variant="neutral">REGULAR</Badge>}
                  </td>
                  <td className="px-5 py-3 font-bold text-emerald-600 text-xs">
                    ₹{(c.wallet?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 font-bold text-pink-600 text-xs">
                    ₹{(c.wallet?.frozenBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedClient(c)}
                    >
                      Quick Summary
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {/* Tab 2: Trades with Clear WIN/LOSE Bird-Eye Visual Indicators */}
      {activeTab === 'trades' && (
        <div className="w-full overflow-x-auto">
          {trades.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">No trades executed by assigned clients yet.</Card>
          ) : (
            <Table headers={['Trade ID', 'Client Name', 'Product Staked', 'Qty', 'Investment', 'Bird-Eye Outcome', 'Net Payout / Profit', 'Status']}>
              {trades.map((t: any) => {
                const isWin = t.outcome === 'WIN';
                const isLose = t.outcome === 'LOSE';
                const profitPct = t.profitPercentage || 20;
                const profitAmt = isWin ? t.totalAmount * (profitPct / 100) : isLose ? -t.totalAmount : 0;
                const payoutAmt = t.payoutAmount || (isWin ? t.totalAmount + profitAmt : isLose ? 0 : t.totalAmount);

                return (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      <div>{t.tradeId}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{new Date(t.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {t.userId && typeof t.userId === 'object' ? (t.userId as any).fullName || 'Client' : 'Client'}
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium">
                      <div className="flex items-center gap-2">
                        {t.productImage && (
                          <img src={t.productImage} alt={t.productName} className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0" />
                        )}
                        <span>{t.productName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-bold">x{t.quantity}</td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3">
                      {isWin ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-700 shadow-sm">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span>▲ WIN (+{profitPct}%)</span>
                        </div>
                      ) : isLose ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 rounded-xl text-xs font-black text-rose-700 shadow-sm">
                          <TrendingDown className="w-4 h-4 text-rose-600" />
                          <span>▼ LOSE (-100%)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>⏳ IN PROGRESS</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-extrabold text-xs">
                      {isWin ? (
                        <span className="text-emerald-600">+₹{payoutAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      ) : isLose ? (
                        <span className="text-rose-600">-₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      ) : (
                        <span className="text-amber-600">₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Staked)</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {t.status === 'SETTLED' ? <Badge variant="verified">SETTLED</Badge> : <Badge variant="warning">PENDING</Badge>}
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </div>
      )}

      {/* Tab 3: Recharges */}
      {activeTab === 'recharges' && (
        <div className="w-full overflow-x-auto">
          {recharges.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">No deposit recharges submitted by assigned clients yet.</Card>
          ) : (
            <Table headers={['Request ID', 'Client Name', 'Amount', 'Method', 'Reference', 'Status', 'Date']}>
              {recharges.map((r: any) => (
                <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">{r.requestId}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    {r.userId && typeof r.userId === 'object' ? (r.userId as any).fullName || 'Client' : 'Client'}
                  </td>
                  <td className="px-5 py-3 font-bold text-emerald-600">
                    +₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-700">{r.paymentMethod}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.referenceNumber}</td>
                  <td className="px-5 py-3">
                    {r.status === 'APPROVED' ? (
                      <Badge variant="success">APPROVED</Badge>
                    ) : r.status === 'REJECTED' ? (
                      <Badge variant="danger">REJECTED</Badge>
                    ) : (
                      <Badge variant="warning">PENDING</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {/* Tab 4: Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="w-full overflow-x-auto">
          {withdrawals.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">No withdrawal requests from assigned clients yet.</Card>
          ) : (
            <Table headers={['Request ID', 'Client Name', 'Amount', 'Payout Details', 'Status', 'Date']}>
              {withdrawals.map((w: any) => (
                <tr key={w._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">{w.requestId}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    {w.userId && typeof w.userId === 'object' ? (w.userId as any).fullName || 'Client' : 'Client'}
                  </td>
                  <td className="px-5 py-3 font-bold text-rose-600">
                    -₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-700">
                    {w.bankName ? `${w.bankName} (${w.accountNumber})` : w.upiId || 'Bank Transfer'}
                  </td>
                  <td className="px-5 py-3">
                    {w.status === 'COMPLETED' ? (
                      <Badge variant="success">COMPLETED</Badge>
                    ) : w.status === 'REJECTED' ? (
                      <Badge variant="danger">REJECTED</Badge>
                    ) : (
                      <Badge variant="warning">PENDING</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {/* Tab 5: Transaction Ledger */}
      {activeTab === 'transactions' && (
        <div className="w-full overflow-x-auto">
          {transactions.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">No transaction activity recorded for assigned clients.</Card>
          ) : (
            <Table headers={['Transaction ID', 'Client Name', 'Type', 'Amount', 'Description', 'Timestamp']}>
              {transactions.map((tx: any) => (
                <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">{tx.transactionId}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    {tx.userId && typeof tx.userId === 'object' ? (tx.userId as any).fullName || 'Client' : 'Client'}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="neutral" size="sm">
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 font-bold text-pink-600">
                    ₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-700 max-w-xs truncate">{tx.description}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {/* IN-PAGE CLIENT CLEAN ULTRA-WIDE COMMAND POPUP MODAL (SINGLE SCROLLBAR, NO FLUFF TEXT) */}
      {selectedClient && (() => {
        const { clientTrades, clientRecharges, clientWithdrawals } = getClientData(selectedClient._id || selectedClient.id);
        const winTradesCount = clientTrades.filter((t: any) => t.outcome === 'WIN').length;
        const loseTradesCount = clientTrades.filter((t: any) => t.outcome === 'LOSE').length;
        const pendingTradesCount = clientTrades.filter((t: any) => t.status === 'PENDING').length;
        const totalTradesStaked = clientTrades.reduce((sum: number, t: any) => sum + (t.totalAmount || 0), 0);

        return (
          <Modal
            isOpen={true}
            onClose={() => setSelectedClient(null)}
            maxWidth="6xl"
            hideHeader={true}
          >
            <div className="space-y-6">
              {/* Top Profile Card Container */}
              <div className="relative p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedClient.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                    alt={selectedClient.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-black text-slate-900">{selectedClient.fullName}</h2>
                      {selectedClient.isVIP && <Badge variant="vip">VIP CLUB</Badge>}
                      {selectedClient.status === 'ACTIVE' ? <Badge variant="verified">ACTIVE</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedClient.email} • {selectedClient.phone || 'No Phone'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">📍 {selectedClient.city || 'Mumbai'} • {selectedClient.gender || 'Female'}</p>
                  </div>
                </div>

                {/* Close Icon Inside Profile Container */}
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition-colors shrink-0"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Vault Balances & Performance */}
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
                      <span>Available Balance</span>
                      <Wallet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      ₹{(selectedClient.wallet?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between text-xs text-pink-700 font-bold mb-1">
                      <span>Frozen Balance</span>
                      <Lock className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="text-2xl font-black text-pink-700 font-mono">
                      ₹{(selectedClient.wallet?.frozenBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                    <h5 className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-pink-600" /> Performance Summary
                    </h5>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Total Trades</span>
                        <span className="font-extrabold text-slate-900">{clientTrades.length} Orders</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Total Staked</span>
                        <span className="font-extrabold text-purple-600">₹{totalTradesStaked.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> {winTradesCount} Wins
                      </span>
                      <span className="text-rose-600 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" /> {loseTradesCount} Losses
                      </span>
                      <span className="text-pink-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {pendingTradesCount} In Progress
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Trade Orders Table */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-pink-600" /> Trade Orders
                    </h4>
                    <span className="text-[11px] font-bold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
                      {clientTrades.length} Total Trades
                    </span>
                  </div>

                  {clientTrades.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl">
                      No trades placed by {selectedClient.fullName}.
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                      <Table headers={['Trade ID & Date', 'Product Item', 'Qty', 'Staked', 'Outcome', 'Net Payout / Profit']}>
                        {clientTrades.map((t: any) => {
                          const isWin = t.outcome === 'WIN';
                          const isLose = t.outcome === 'LOSE';
                          const profitPct = t.profitPercentage || 20;
                          const profitAmt = isWin ? t.totalAmount * (profitPct / 100) : isLose ? -t.totalAmount : 0;
                          const payoutAmt = t.payoutAmount || (isWin ? t.totalAmount + profitAmt : isLose ? 0 : t.totalAmount);

                          return (
                            <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs">
                                <div className="font-bold text-slate-900">{t.tradeId}</div>
                                <div className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-800 font-medium">
                                <div className="flex items-center gap-2">
                                  {t.productImage && (
                                    <img src={t.productImage} alt={t.productName} className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0" />
                                  )}
                                  <span className="truncate max-w-[130px]">{t.productName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-700">x{t.quantity}</td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-900 font-mono">
                                ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3">
                                {isWin ? (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-black text-emerald-700">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>▲ WIN (+{profitPct}%)</span>
                                  </div>
                                ) : isLose ? (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-black text-rose-700">
                                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                                    <span>▼ LOSE (-100%)</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-xl text-[11px] font-bold text-pink-700">
                                    <Clock className="w-3 h-3 text-pink-600" />
                                    <span>IN PROGRESS</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs font-black font-mono">
                                {isWin ? (
                                  <span className="text-emerald-700">+₹{payoutAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                ) : isLose ? (
                                  <span className="text-rose-700">-₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                ) : (
                                  <span className="text-pink-600">₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </Table>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Financial History Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Recharges */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-emerald-600" /> Deposits ({clientRecharges.length})
                  </h4>

                  {clientRecharges.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      No deposits.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clientRecharges.map((r: any) => (
                        <div key={r._id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-emerald-700 font-mono">+₹{r.amount.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-slate-500">{r.paymentMethod} • Ref: {r.referenceNumber}</div>
                          </div>
                          <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'} size="sm">
                            {r.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Withdrawals */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-rose-600" /> Withdrawals ({clientWithdrawals.length})
                  </h4>

                  {clientWithdrawals.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      No withdrawals.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clientWithdrawals.map((w: any) => (
                        <div key={w._id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-rose-700 font-mono">-₹{w.amount.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-slate-500">{w.bankName || 'Bank Account'} ({w.accountNumber || 'N/A'})</div>
                          </div>
                          <Badge variant={w.status === 'COMPLETED' ? 'success' : w.status === 'REJECTED' ? 'danger' : 'warning'} size="sm">
                            {w.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};
