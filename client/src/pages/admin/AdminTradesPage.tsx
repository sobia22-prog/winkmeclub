import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Trade } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { TrendingUp, Trophy, XCircle, CheckCircle2, Edit3, RefreshCw } from 'lucide-react';

export const AdminTradesPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'WIN' | 'LOSE' | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);

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
          <p className="text-xs text-slate-400">Review pending trades, assign Win Profit percentages (20%-100%), or modify previous trade results.</p>
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
        <Table headers={['Trade ID', 'User', 'Product', 'Qty', 'Amount (₹)', 'Status', 'Outcome & Profit', 'Actions']}>
          {filteredTrades.map((t: any) => (
            <tr key={t._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-mono font-bold text-slate-200">{t.tradeId}</td>
              <td className="px-5 py-3 font-semibold text-slate-200">
                {typeof t.userId === 'object' ? t.userId.fullName : 'User'}
              </td>
              <td className="px-5 py-3 text-slate-300 font-medium">{t.productName}</td>
              <td className="px-5 py-3 text-slate-300">x{t.quantity}</td>
              <td className="px-5 py-3 font-bold text-emerald-400">
                ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                {t.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
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
                      WIN (+Profit)
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
                      LOSE (Freeze)
                    </Button>
                  </div>
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
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Settlement Confirmation Popup Modal */}
      {selectedTrade && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTrade(null)}
          title={`Confirm Trade Result — #${selectedTrade.tradeId}`}
        >
          <form onSubmit={handleSettleSubmit} className="space-y-4">
            <div className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-1.5 text-xs">
              <div>User: <span className="font-bold text-slate-100">{typeof selectedTrade.userId === 'object' ? selectedTrade.userId.fullName : 'User'}</span></div>
              <div>Product: <span className="font-bold text-slate-100">{selectedTrade.productName} (Qty: {selectedTrade.quantity})</span></div>
              <div>Trade Amount: <span className="font-bold text-emerald-400">₹{selectedTrade.totalAmount.toFixed(2)}</span></div>
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
                  { label: '20% Profit (+₹' + (selectedTrade.totalAmount * 0.2).toFixed(2) + ')', value: '20' },
                  { label: '40% Profit (+₹' + (selectedTrade.totalAmount * 0.4).toFixed(2) + ')', value: '40' },
                  { label: '60% Profit (+₹' + (selectedTrade.totalAmount * 0.6).toFixed(2) + ')', value: '60' },
                  { label: '80% Profit (+₹' + (selectedTrade.totalAmount * 0.8).toFixed(2) + ')', value: '80' },
                  { label: '100% Profit (+₹' + (selectedTrade.totalAmount * 1.0).toFixed(2) + ')', value: '100' },
                ]}
              />
            )}

            {settlementOutcome === 'LOSE' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                Trade amount ₹{selectedTrade.totalAmount.toFixed(2)} will be moved into the user's Frozen Balance.
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
