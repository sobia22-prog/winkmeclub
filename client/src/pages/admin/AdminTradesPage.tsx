import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Trade } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { TrendingUp, Trophy, XCircle, CheckCircle2 } from 'lucide-react';

export const AdminTradesPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Settlement Modal State
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [settlementOutcome, setSettlementOutcome] = useState<'WIN' | 'LOSE'>('WIN');
  const [profitPercentage, setProfitPercentage] = useState<number>(20);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTrades({ status });
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
  }, [status]);

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;
    setActionLoading(true);

    try {
      const res = await adminService.settleTrade(selectedTrade.tradeId, {
        outcome: settlementOutcome,
        profitPercentage,
        note,
      });

      if (res.data.success) {
        setMessage(`Trade #${selectedTrade.tradeId} settled as ${settlementOutcome}${settlementOutcome === 'WIN' ? ` (+${profitPercentage}% profit)` : ''}!`);
        setSelectedTrade(null);
        setNote('');
        fetchTrades();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Settlement failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-400" /> Airborne Trade Request Management
          </h1>
          <p className="text-xs text-slate-400">Review pending product trades, assign Win Profit percentages (20%-100%), or move Lose trades to Frozen balance.</p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: 'All Trades', value: 'ALL' },
              { label: 'Pending Trades', value: 'PENDING' },
              { label: 'Settled Trades', value: 'SETTLED' },
            ]}
          />
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
        </div>
      )}

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading trade requests...</Card>
      ) : trades.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No trade requests found for filter.</Card>
      ) : (
        <Table headers={['Trade ID', 'User', 'Product', 'Qty', 'Amount (₹)', 'Status', 'Outcome & Profit', 'Actions']}>
          {trades.map((t: any) => (
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
                  <span className="text-xs text-slate-500 italic">Settled</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Settlement Modal */}
      {selectedTrade && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTrade(null)}
          title={`Confirm Airborne Trade Outcome — #${selectedTrade.tradeId}`}
        >
          <form onSubmit={handleSettleSubmit} className="space-y-4">
            <div className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-1.5 text-xs">
              <div>User: <span className="font-bold text-slate-100">{typeof selectedTrade.userId === 'object' ? selectedTrade.userId.fullName : 'User'}</span></div>
              <div>Product: <span className="font-bold text-slate-100">{selectedTrade.productName} (Qty: {selectedTrade.quantity})</span></div>
              <div>Trade Amount: <span className="font-bold text-emerald-400">₹{selectedTrade.totalAmount.toFixed(2)}</span></div>
              <div>Selected Outcome: <span className={`font-bold ${settlementOutcome === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>{settlementOutcome}</span></div>
            </div>

            {settlementOutcome === 'WIN' && (
              <Select
                label="Select Win Profit Percentage to Credit User"
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

            <Input
              label="Settlement Audit Note (Optional)"
              placeholder="Reason / market outcome reference..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedTrade(null)} type="button">
                Cancel
              </Button>
              <Button
                variant={settlementOutcome === 'WIN' ? 'gold' : 'danger'}
                type="submit"
                isLoading={actionLoading}
              >
                Confirm {settlementOutcome} Settlement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
