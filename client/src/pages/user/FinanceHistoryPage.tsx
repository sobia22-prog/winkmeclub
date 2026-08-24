import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { walletService } from '../../services/wallet.service';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { RechargeRequest, WithdrawalRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { History, ArrowLeft, ArrowDownRight, ArrowUpRight, Clock, Eye } from 'lucide-react';

export const FinanceHistoryPage: React.FC = () => {
  const { wallet } = useAuth();
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || 'INR';

  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECHARGE' | 'WITHDRAWAL'>('ALL');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      walletService.getMyRecharges(),
      walletService.getMyWithdrawals(),
    ])
      .then(([rcgRes, wtdRes]) => {
        if (rcgRes.data.success) setRecharges(rcgRes.data.recharges || []);
        if (wtdRes.data.success) setWithdrawals(wtdRes.data.withdrawals || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalRecharge = recharges
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalWithdrawal = withdrawals
    .filter((w) => w.status === 'APPROVED' || w.status === 'COMPLETED')
    .reduce((sum, w) => sum + w.amount, 0);

  const combinedList = [
    ...recharges.map((r) => ({ ...r, itemType: 'RECHARGE' })),
    ...withdrawals.map((w) => ({ ...w, itemType: 'WITHDRAWAL' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredList = combinedList.filter((item) => {
    if (activeTab === 'RECHARGE') return item.itemType === 'RECHARGE';
    if (activeTab === 'WITHDRAWAL') return item.itemType === 'WITHDRAWAL';
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-24">
      {/* Top Header Bar (Matching SS 4) */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" /> Finance History
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Recharges, withdrawals, and ledger activity</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400">More</span>
      </div>

      {/* Main Container Card (Matching SS 4 Layout) */}
      <Card className="p-5 space-y-5 bg-brand-surface border border-brand-border rounded-3xl shadow-xl min-h-[400px]">
        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'ALL'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RECHARGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'RECHARGE'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recharges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WITHDRAWAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'WITHDRAWAL'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Withdrawals
          </button>
        </div>

        {/* Summary Header Box (Matching SS 4: Total Recharge & Total Withdrawal) */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-brand-card/80 border border-brand-border rounded-2xl text-xs text-center divide-x divide-brand-border">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Recharge</span>
            <span className="text-base font-black text-emerald-400 font-mono block">
              {totalRecharge.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{currencySymbol}</span>
          </div>

          <div className="space-y-1 pl-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Withdrawal</span>
            <span className="text-base font-black text-rose-400 font-mono block">
              {totalWithdrawal.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{currencySymbol}</span>
          </div>
        </div>

        {/* Financial Log List */}
        {loading ? (
          <p className="text-center text-xs text-slate-500 py-10">Loading finance history...</p>
        ) : filteredList.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-12 space-y-2">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <p>No finance records found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item: any) => {
              const isRecharge = item.itemType === 'RECHARGE';
              return (
                <div key={item._id} className="p-4 bg-brand-card border border-brand-border rounded-2xl space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${isRecharge ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        {isRecharge ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{isRecharge ? 'Wallet Deposit Recharge' : 'Payout Withdrawal'}</h4>
                        <span className="text-[10px] font-mono text-slate-400 block">ID: {item.requestId}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-black font-mono block ${isRecharge ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isRecharge ? '+' : '-'}{currencySymbol} {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      {item.status === 'APPROVED' && <Badge variant="success">APPROVED</Badge>}
                      {item.status === 'COMPLETED' && <Badge variant="success">COMPLETED</Badge>}
                      {item.status === 'PENDING' && <Badge variant="pending">PENDING</Badge>}
                      {item.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {new Date(item.createdAt).toLocaleString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Item Details Popup Modal */}
      {selectedItem && (
        <Modal isOpen={true} onClose={() => setSelectedItem(null)} title="Transaction Details">
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-brand-card border border-brand-border rounded-2xl space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Request ID:</span>
                <span className="text-slate-100 font-bold">{selectedItem.requestId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-purple-400 font-bold">{selectedItem.itemType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-amber-400 font-bold">{currencySymbol} {selectedItem.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">{selectedItem.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-300">{new Date(selectedItem.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-brand-card hover:bg-brand-card/80 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
