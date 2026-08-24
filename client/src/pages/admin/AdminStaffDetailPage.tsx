import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import {
  Users,
  ArrowLeft,
  Key,
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  History,
  Eye,
  CheckCircle2,
  AlertCircle,
  Activity,
  UserCheck,
} from 'lucide-react';

export const AdminStaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'clients' | 'trades' | 'recharges' | 'withdrawals' | 'transactions'>('clients');

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

  const { staff, stats, clients, trades, recharges, withdrawals, transactions } = data;

  return (
    <div className="space-y-6 w-full">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/staff')}>
          Back to Staff Directory
        </Button>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/40 rounded-full font-mono text-xs font-bold text-amber-400">
          <Key className="w-3.5 h-3.5" /> Code: {staff.invitationCode || 'N/A'}
        </div>
      </div>

      {/* Staff Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-brand-surface to-brand-surface border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-2xl shadow-xl shrink-0">
              {staff.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-100">{staff.fullName}</h1>
                {staff.status === 'ACTIVE' ? <Badge variant="verified">ACTIVE STAFF</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {staff.email} {staff.phone ? `• ${staff.phone}` : ''}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Joined: {new Date(staff.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-brand-border/60">
          <StatCard
            title="Assigned Clients"
            value={stats.clientCount}
            subtitle="Directly linked members"
            icon={<Users className="w-5 h-5 text-amber-400" />}
          />
          <StatCard
            title="Total Client Revenue"
            value={`₹${(stats.totalApprovedRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle="From approved deposits"
            icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            title="Client Trade Volume"
            value={`₹${(stats.totalTradeVolume || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle="Across settled trades"
            icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          />
          <StatCard
            title="Total Trade Activity"
            value={stats.tradesCount}
            subtitle="Executed trade orders"
            icon={<Activity className="w-5 h-5 text-cyan-400" />}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-brand-border overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-brand-card'
          }`}
        >
          <Users className="w-4 h-4" /> Associated Clients ({clients.length})
        </button>

        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'trades'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-brand-card'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Trades ({trades.length})
        </button>

        <button
          onClick={() => setActiveTab('recharges')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recharges'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-brand-card'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" /> Recharges ({recharges.length})
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'withdrawals'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-brand-card'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Withdrawals ({withdrawals.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-brand-card'
          }`}
        >
          <History className="w-4 h-4" /> Transaction Ledger ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Associated Clients */}
      {activeTab === 'clients' && (
        <div className="w-full overflow-x-auto">
          {clients.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">
              No clients have registered with this staff member's invitation code (`{staff.invitationCode}`) yet.
            </Card>
          ) : (
            <Table headers={['Client Name & Email', 'City', 'Status', 'VIP Status', 'Available Balance', 'Frozen Balance', 'Action']}>
              {clients.map((c: any) => (
                <tr key={c._id || c.id} className="hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                        alt={c.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-brand-border shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100">{c.fullName}</div>
                        <div className="text-[11px] text-slate-400">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-300 font-medium">{c.city || 'Mumbai'}</td>
                  <td className="px-5 py-3">
                    {c.status === 'ACTIVE' ? <Badge variant="verified">ACTIVE</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    {c.isVIP ? <Badge variant="vip">VIP CLUB</Badge> : <Badge variant="neutral">REGULAR</Badge>}
                  </td>
                  <td className="px-5 py-3 font-bold text-emerald-400 text-xs">
                    ₹{(c.wallet?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 font-bold text-amber-400 text-xs">
                    ₹{(c.wallet?.frozenBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3">
                    <Link to={`/admin/users/${c._id || c.id}`}>
                      <Button variant="secondary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Inspect Client
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {/* Tab 2: Trades */}
      {activeTab === 'trades' && (
        <div className="w-full overflow-x-auto">
          {trades.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">No trades executed by assigned clients yet.</Card>
          ) : (
            <Table headers={['Trade ID', 'Client Name', 'Product', 'Qty', 'Total Amount', 'Outcome', 'Status', 'Date']}>
              {trades.map((t: any) => (
                <tr key={t._id} className="hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-200">{t.tradeId}</td>
                  <td className="px-5 py-3 font-semibold text-slate-200">
                    {t.userId && typeof t.userId === 'object' ? t.userId.fullName : 'Client'}
                  </td>
                  <td className="px-5 py-3 text-slate-300 font-medium">{t.productName}</td>
                  <td className="px-5 py-3 text-slate-300">x{t.quantity}</td>
                  <td className="px-5 py-3 font-bold text-emerald-400">
                    ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3">
                    {t.outcome === 'WIN' ? (
                      <Badge variant="success">WIN (+{t.profitPercentage || 20}%)</Badge>
                    ) : t.outcome === 'LOSE' ? (
                      <Badge variant="danger">LOSE</Badge>
                    ) : (
                      <Badge variant="pending">PENDING</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {t.status === 'SETTLED' ? <Badge variant="verified">SETTLED</Badge> : <Badge variant="warning">PENDING</Badge>}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
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
                <tr key={r._id} className="hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-200">{r.requestId}</td>
                  <td className="px-5 py-3 font-semibold text-slate-200">
                    {r.userId && typeof r.userId === 'object' ? r.userId.fullName : 'Client'}
                  </td>
                  <td className="px-5 py-3 font-bold text-emerald-400">
                    +₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-300">{r.paymentMethod}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.referenceNumber}</td>
                  <td className="px-5 py-3">
                    {r.status === 'APPROVED' ? (
                      <Badge variant="success">APPROVED</Badge>
                    ) : r.status === 'REJECTED' ? (
                      <Badge variant="danger">REJECTED</Badge>
                    ) : (
                      <Badge variant="warning">PENDING</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
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
                <tr key={w._id} className="hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-200">{w.requestId}</td>
                  <td className="px-5 py-3 font-semibold text-slate-200">
                    {w.userId && typeof w.userId === 'object' ? w.userId.fullName : 'Client'}
                  </td>
                  <td className="px-5 py-3 font-bold text-rose-400">
                    -₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-300">
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
                  <td className="px-5 py-3 text-xs text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
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
                <tr key={tx._id} className="hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-200">{tx.transactionId}</td>
                  <td className="px-5 py-3 font-semibold text-slate-200">
                    {tx.userId && typeof tx.userId === 'object' ? tx.userId.fullName : 'Client'}
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
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}
    </div>
  );
};
