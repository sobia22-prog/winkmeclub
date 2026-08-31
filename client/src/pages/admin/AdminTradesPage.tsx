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
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-pink-600" /> Airborne Trade Request Management
          </h1>
          <p className="text-xs text-slate-500">Review pending trades, view full trade details, assign Win Profit percentages (20%-100%), or modify results.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>
      )}

      {/* Separated Trade Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-pink-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Pending Trades</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{pendingCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('WIN')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'WIN'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>WIN Trades 🎉</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{winCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('LOSE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'LOSE'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>LOSE Trades</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{loseCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>All Trades</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{trades.length}</span>
        </button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading trade requests...</Card>
      ) : filteredTrades.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No trades found in this section.</Card>
      ) : (
        <Table headers={['Trade ID', 'User', 'Product', 'Qty', `Amount (${currencySymbol})`, 'Status', 'Outcome & Profit', 'Actions']}>
          {filteredTrades.map((t: any) => (
            <tr key={t._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-mono font-bold text-slate-900">{t.tradeId}</td>
              <td className="px-5 py-3 font-semibold text-slate-800">
                {t.userId && typeof t.userId === 'object' ? t.userId.fullName : 'User'}
              </td>
              <td className="px-5 py-3 text-slate-700 font-medium">{t.productName}</td>
              <td className="px-5 py-3 text-slate-700">x{t.quantity}</td>
              <td className="px-5 py-3 font-bold text-emerald-600">
                {currencySymbol}{t.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3">
                {t.status === 'PENDING' ? <Badge variant="pending">PENDING</Badge> : <Badge variant="neutral">SETTLED</Badge>}
              </td>
              <td className="px-5 py-3">
                {t.outcome === 'WIN' && (
                  <Badge variant="success">WIN 🎉 (+{t.profitPercentage || 20}%)</Badge>
                )}
                {t.outcome === 'LOSE' && <Badge variant="danger">LOSE (DEDUCTED)</Badge>}
                {t.outcome === 'NONE' && <Badge variant="warning">NONE</Badge>}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingTrade(t)}
                    className="p-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-600 hover:bg-pink-100 transition-colors"
                    title="View Full Trade Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {t.status === 'PENDING' ? (
                    <>
                      <Button
                        variant="primary"
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

      {/* VIEW TRADE REQUEST DETAILS POPUP MODAL */}
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
              {/* Top Summary Banner */}
              <div className="grid grid-cols-3 gap-4 p-5 bg-pink-50/50 border border-pink-100 rounded-2xl text-center shadow-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block">PICK / ITEM</span>
                  <span className="text-sm font-black text-pink-600 truncate block mt-0.5">{viewingTrade.productName}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block">QUANTITY</span>
                  <span className="text-base font-black text-slate-900 block mt-0.5">{viewingTrade.quantity}.00</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block">TOTAL AMOUNT</span>
                  <span className="text-base font-black text-emerald-600 block mt-0.5">
                    {currencySymbol}{viewingTrade.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Customer Profile Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center font-black text-lg shrink-0">
                  {userObj?.fullName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">CUSTOMER</span>
                  <span className="text-base font-extrabold text-slate-900">{userObj?.fullName || 'User / Deleted Account'}</span>
                </div>
              </div>

              {/* TRADE INFORMATION Section */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-2">
                  TRADE INFORMATION
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block font-semibold text-[11px]">Customer Email</span>
                    <span className="text-slate-800 font-bold">{userObj?.email || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-semibold text-[11px]">Products</span>
                    <span className="text-slate-800 font-bold">{viewingTrade.productName}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-semibold text-[11px]">Referral / Staff Code</span>
                    <span className="text-pink-600 font-mono font-bold">
                      {staffObj?.invitationCode ? `${staffObj.invitationCode} (${staffObj.fullName})` : 'Unassigned'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-semibold text-[11px]">Trade Status</span>
                    <span className="font-bold">
                      {viewingTrade.status === 'SETTLED' ? <Badge variant="verified">SETTLED</Badge> : <Badge variant="warning">PENDING</Badge>}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-semibold text-[11px]">Bird-Eye Outcome</span>
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
                    <span className="text-slate-500 block font-semibold text-[11px]">Created Date</span>
                    <span className="text-slate-700 font-medium">{new Date(viewingTrade.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {viewingTrade.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
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
            <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-xl space-y-1.5 text-xs text-slate-700">
              <div>User: <span className="font-bold text-slate-900">{selectedTrade.userId && typeof selectedTrade.userId === 'object' ? (selectedTrade.userId as any).fullName : 'User'}</span></div>
              <div>Product: <span className="font-bold text-slate-900">{selectedTrade.productName} (Qty: {selectedTrade.quantity})</span></div>
              <div>Trade Amount: <span className="font-bold text-emerald-600">{currencySymbol}{selectedTrade.totalAmount.toFixed(2)}</span></div>
              <div>Decided Outcome: <span className={`font-bold ${settlementOutcome === 'WIN' ? 'text-emerald-600' : 'text-rose-600'}`}>{settlementOutcome}</span></div>
            </div>

            <Select
              label="Select Desired Result Action"
              value={settlementOutcome}
              onChange={(e: any) => setSettlementOutcome(e.target.value)}
              options={[
                { label: 'WIN (Credit User Available Balance with Profit %)', value: 'WIN' },
                { label: 'LOSE (Deduct Staked Amount - Lost & Gone Forever)', value: 'LOSE' },
              ]}
            />

            {settlementOutcome === 'WIN' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Win Profit Margin Percentage (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="1000"
                      placeholder="e.g. 25"
                      value={profitPercentage}
                      onChange={(e) => setProfitPercentage(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono font-black text-sm focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-sm font-black text-pink-600 shrink-0 font-mono">%</span>
                  </div>
                </div>

                {/* Preset Profit Percentage Quick Selector */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 100, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setProfitPercentage(pct)}
                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all ${
                        profitPercentage === pct
                          ? 'bg-pink-600 border-pink-600 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Live Payout Breakdown Calculation Box (Matching User Prompt 100%) */}
                {(() => {
                  const tradeAmt = selectedTrade.totalAmount;
                  const profitAmt = Number((tradeAmt * (profitPercentage / 100)).toFixed(2));
                  const totalPayout = Number((tradeAmt + profitAmt).toFixed(2));

                  return (
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>Traded Amount (Returned):</span>
                        <span className="font-mono font-bold text-slate-900">{currencySymbol}{tradeAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>Win Profit Margin ({profitPercentage}%):</span>
                        <span className="font-mono font-black text-emerald-600">+ {currencySymbol}{profitAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-2 border-t border-emerald-200/80 flex justify-between items-center text-emerald-900 font-extrabold text-sm">
                        <span>Total Added to Balance:</span>
                        <span className="font-mono font-black text-base text-emerald-700">{currencySymbol}{totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {settlementOutcome === 'LOSE' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                Trade amount {currencySymbol}{selectedTrade.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} will be permanently deducted and lost forever.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedTrade(null)} type="button">
                Cancel
              </Button>
              <Button
                variant={settlementOutcome === 'WIN' ? 'primary' : 'danger'}
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
