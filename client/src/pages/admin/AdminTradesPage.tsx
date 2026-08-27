import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Trade } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  XCircle,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Eye,
  Clock,
  UserCheck,
} from 'lucide-react';

export const AdminTradesPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'WIN' | 'LOSE' | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);

  // Viewing Trade Modal State
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);

  // Settlement Modal State
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [settlementOutcome, setSettlementOutcome] = useState<'WIN' | 'LOSE'>('WIN');
  const [profitPercentage, setProfitPercentage] = useState<number>(20);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTrades({ status: 'ALL' });
      if (res.data.success) {
        setTrades(res.data.trades);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;
    setActionLoading(true);

    try {
      const res = await adminService.settleTrade(selectedTrade.tradeId, {
        outcome: settlementOutcome,
        profitPercentage,
      });

      if (res.data.success) {
        setMessage(`Trade #${selectedTrade.tradeId} result updated as ${settlementOutcome}${settlementOutcome === 'WIN' ? ` (+${profitPercentage}% profit)` : ''}!`);
        setSelectedTrade(null);
        fetchTrades();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Settlement failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter trades based on active tab
  const filteredTrades = trades.filter((t) => {
    if (activeTab === 'PENDING') return t.status === 'PENDING';
    if (activeTab === 'WIN') return t.outcome === 'WIN';
    if (activeTab === 'LOSE') return t.outcome === 'LOSE';
    return true; // ALL
  });

  const pendingCount = trades.filter((t) => t.status === 'PENDING').length;
  const winCount = trades.filter((t) => t.outcome === 'WIN').length;
  const loseCount = trades.filter((t) => t.outcome === 'LOSE').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-400" /> Airborne Trade Request Management
          </h1>
          <p className="text-xs text-slate-400">Review pending trades, view full trade details, assign Win Profit percentages (20%-100%), or modify results.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Separated Trade Status Tabs (Pending / WIN / LOSE / All) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-brand-border pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-brand-surface border border-brand-border text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Pending Trades</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-[10px]">{pendingCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('WIN')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'WIN'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-brand-surface border border-brand-border text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>WIN Trades 🎉</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/20 text-[10px]">{winCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('LOSE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'LOSE'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-brand-surface border border-brand-border text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>LOSE Trades</span>
          <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{loseCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'bg-brand-wine text-white shadow-md shadow-brand-wine/20'
              : 'bg-brand-surface border border-brand-border text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All Trades</span>
          <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{trades.length}</span>
        </button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading trade requests...</Card>
      ) : filteredTrades.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No trades found in this section.</Card>
      ) : (
        <Table headers={['Trade ID', 'User', 'Product', 'Qty', `Amount (${currencySymbol})`, 'Status', 'Outcome & Profit', 'Actions']}>
          {filteredTrades.map((t: any) => (
            <tr key={t._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-mono font-bold text-slate-200">{t.tradeId}</td>
              <td className="px-5 py-3 font-semibold text-slate-200">
                {t.userId && typeof t.userId === 'object' ? t.userId.fullName : 'User'}
              </td>
              <td className="px-5 py-3 text-slate-300 font-medium">{t.productName}</td>
              <td className="px-5 py-3 text-slate-300">x{t.quantity}</td>
              <td className="px-5 py-3 font-bold text-emerald-400">
                {currencySymbol}{t.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3">
                {t.status === 'PENDING' ? <Badge variant="pending">PENDING</Badge> : <Badge variant="neutral">SETTLED</Badge>}
              </td>
              <td className="px-5 py-3">
                {t.outcome === 'WIN' && (
                  <Badge variant="success">WIN 🎉 (+{t.profitPercentage || 20}%)</Badge>
                )}
                {t.outcome === 'LOSE' && <Badge variant="danger">LOSE (FROZEN)</Badge>}
                {t.outcome === 'NONE' && <Badge variant="warning">NONE</Badge>}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingTrade(t)}
                    className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
                    title="View Full Trade Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {t.status === 'PENDING' ? (
                    <>
                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<Trophy className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setSelectedTrade(t);
                          setSettlementOutcome('WIN');
                          setProfitPercentage(20);
                        }}
                      >
                        WIN
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setSelectedTrade(t);
                          setSettlementOutcome('LOSE');
                        }}
                      >
                        LOSE
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedTrade(t);
                        setSettlementOutcome(t.outcome === 'WIN' ? 'LOSE' : 'WIN');
                        setProfitPercentage(t.profitPercentage || 20);
                      }}
                    >
                      Change Result
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* VIEW TRADE REQUEST DETAILS POPUP MODAL (Matching Reference Image) */}
      {viewingTrade && (() => {
        const userObj = typeof viewingTrade.userId === 'object' ? (viewingTrade.userId as any) : null;
        const staffObj = userObj?.assignedStaff && typeof userObj.assignedStaff === 'object' ? userObj.assignedStaff : null;
        const isWin = viewingTrade.outcome === 'WIN';
        const isLose = viewingTrade.outcome === 'LOSE';
        const profitPct = (viewingTrade as any).profitPercentage || 20;

        return (
          <Modal
            isOpen={true}
            onClose={() => setViewingTrade(null)}
            title="Trade Request Details"
            subtitle={`Round #${viewingTrade.tradeId}`}
            maxWidth="2xl"
          >
            <div className="space-y-6">
              {/* Top Summary Banner: PICK / SELECTION, QUANTITY, TOTAL AMOUNT */}
              <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-r from-amber-950/40 via-brand-card to-brand-surface border border-amber-500/30 rounded-2xl text-center shadow-lg">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">PICK / ITEM</span>
                  <span className="text-sm font-black text-amber-400 truncate block mt-0.5">{viewingTrade.productName}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">QUANTITY</span>
                  <span className="text-base font-black text-slate-100 block mt-0.5">{viewingTrade.quantity}.00</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">TOTAL AMOUNT</span>
                  <span className="text-base font-black text-emerald-400 block mt-0.5">
                    {currencySymbol}{viewingTrade.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Customer Profile Card */}
              <div className="p-4 bg-brand-card border border-brand-border rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black text-lg shrink-0">
                  {userObj?.fullName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CUSTOMER</span>
                  <span className="text-base font-extrabold text-slate-100">{userObj?.fullName || 'User / Deleted Account'}</span>
                </div>
              </div>

              {/* TRADE INFORMATION Section */}
              <div className="p-5 bg-brand-card/60 border border-brand-border rounded-2xl space-y-3 text-xs">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-brand-border pb-2">
                  TRADE INFORMATION
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[11px]">Customer Email</span>
                    <span className="text-slate-200 font-bold">{userObj?.email || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold text-[11px]">Products</span>
                    <span className="text-slate-200 font-bold">{viewingTrade.productName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold text-[11px]">Referral / Staff Code</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {staffObj?.invitationCode ? `${staffObj.invitationCode} (${staffObj.fullName})` : 'Unassigned'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold text-[11px]">Trade Status</span>
                    <span className="font-bold">
                      {viewingTrade.status === 'SETTLED' ? <Badge variant="verified">SETTLED</Badge> : <Badge variant="warning">PENDING</Badge>}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold text-[11px]">Bird-Eye Outcome</span>
                    <div className="mt-0.5">
                      {isWin ? (
                        <Badge variant="success">▲ WIN (+{profitPct}%)</Badge>
                      ) : isLose ? (
                        <Badge variant="danger">▼ LOSE (-100%)</Badge>
                      ) : (
                        <Badge variant="warning">⏳ IN PROGRESS</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold text-[11px]">Created Date</span>
                    <span className="text-slate-300 font-medium">{new Date(viewingTrade.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {viewingTrade.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<Trophy className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedTrade(viewingTrade);
                        setViewingTrade(null);
                        setSettlementOutcome('WIN');
                        setProfitPercentage(20);
                      }}
                    >
                      Settle as WIN
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedTrade(viewingTrade);
                        setViewingTrade(null);
                        setSettlementOutcome('LOSE');
                      }}
                    >
                      Settle as LOSE
                    </Button>
                  </div>
                ) : (
                  <div />
                )}

                <Button variant="secondary" onClick={() => setViewingTrade(null)}>
                  Close Details
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Settlement Confirmation Popup Modal */}
      {selectedTrade && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTrade(null)}
          title={`Confirm Trade Result — #${selectedTrade.tradeId}`}
        >
          <form onSubmit={handleSettleSubmit} className="space-y-4">
            <div className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-1.5 text-xs">
              <div>User: <span className="font-bold text-slate-100">{selectedTrade.userId && typeof selectedTrade.userId === 'object' ? (selectedTrade.userId as any).fullName : 'User'}</span></div>
              <div>Product: <span className="font-bold text-slate-100">{selectedTrade.productName} (Qty: {selectedTrade.quantity})</span></div>
              <div>Trade Amount: <span className="font-bold text-emerald-400">{currencySymbol}{selectedTrade.totalAmount.toFixed(2)}</span></div>
              <div>Decided Outcome: <span className={`font-bold ${settlementOutcome === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>{settlementOutcome}</span></div>
            </div>

            <Select
              label="Select Desired Result Action"
              value={settlementOutcome}
              onChange={(e: any) => setSettlementOutcome(e.target.value)}
              options={[
                { label: 'WIN (Credit User Available Balance with Profit %)', value: 'WIN' },
                { label: 'LOSE (Move Trade Amount to Frozen Balance)', value: 'LOSE' },
              ]}
            />

            {settlementOutcome === 'WIN' && (
              <Select
                label="Select Win Profit Percentage"
                value={profitPercentage.toString()}
                onChange={(e) => setProfitPercentage(Number(e.target.value))}
                options={[
                  { label: '20% Profit (+' + currencySymbol + (selectedTrade.totalAmount * 0.2).toFixed(2) + ')', value: '20' },
                  { label: '40% Profit (+' + currencySymbol + (selectedTrade.totalAmount * 0.4).toFixed(2) + ')', value: '40' },
                  { label: '60% Profit (+' + currencySymbol + (selectedTrade.totalAmount * 0.6).toFixed(2) + ')', value: '60' },
                  { label: '80% Profit (+' + currencySymbol + (selectedTrade.totalAmount * 0.8).toFixed(2) + ')', value: '80' },
                  { label: '100% Profit (+' + currencySymbol + (selectedTrade.totalAmount * 1.0).toFixed(2) + ')', value: '100' },
                ]}
              />
            )}

            {settlementOutcome === 'LOSE' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                Trade amount {currencySymbol}{selectedTrade.totalAmount.toFixed(2)} will be moved into the user's Frozen Balance.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedTrade(null)} type="button">
                Cancel
              </Button>
              <Button
                variant={settlementOutcome === 'WIN' ? 'gold' : 'danger'}
                type="submit"
                isLoading={actionLoading}
              >
                Confirm {settlementOutcome} Result
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
