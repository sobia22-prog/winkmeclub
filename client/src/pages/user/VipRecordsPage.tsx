import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tradeService } from '../../services/trade.service';
import { Trade } from '../../types';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { CreditCard, ArrowLeft, Clock, Award, CheckCircle2 } from 'lucide-react';

export const VipRecordsPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || 'INR';

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tradeService
      .getMyTrades()
      .then((res) => {
        if (res.data.success) {
          setTrades(res.data.trades || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-24">
      {/* Top Header Bar (Matching SS 2) */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" /> VIP Records
            </h1>
            <p className="text-[11px] text-slate-400 font-medium font-mono">Airborne round trade activity log</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400">More</span>
      </div>

      {/* Main Container Card (Matching SS 2 Layout) */}
      <Card className="p-5 space-y-4 bg-brand-surface border border-brand-border rounded-3xl shadow-xl min-h-[350px]">
        <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-extrabold border border-amber-500/30">
            VIP
          </span>
        </div>

        {loading ? (
          <p className="text-center text-xs text-slate-500 py-10">Loading VIP trade records...</p>
        ) : trades.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-12 space-y-2">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
            <p>No VIP trade records found yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trades.map((t: any) => (
              <div key={t._id} className="p-4 bg-brand-card border border-brand-border rounded-2xl space-y-3 shadow-md">
                <div className="flex items-start justify-between gap-3 border-b border-brand-border/40 pb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.productImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80'}
                      alt={t.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-brand-border shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-100">{t.productName}</h4>
                      <span className="text-[10px] font-mono text-slate-400 block">ID: {t.tradeId}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {t.outcome === 'WIN' && <Badge variant="vip">WIN 🎉 (+{t.profitPercentage || 20}%)</Badge>}
                    {t.outcome === 'LOSE' && <Badge variant="danger">LOSE</Badge>}
                    {t.outcome === 'NONE' && <Badge variant="pending">IN ROUND</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Traded Amount:</span>
                    <strong className="text-amber-400 font-mono text-xs">{currencySymbol} {t.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block">Settlement Outcome:</span>
                    <strong className={t.outcome === 'WIN' ? 'text-emerald-400 font-mono text-xs' : 'text-slate-300 font-mono text-xs'}>
                      {t.outcome === 'WIN' ? `+${currencySymbol} ${(t.payoutAmount || t.totalAmount * 0.2).toFixed(2)}` : 'Frozen Hold'}
                    </strong>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between border-t border-brand-border/30">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" /> {new Date(t.createdAt).toLocaleString()}
                  </span>
                  <span className="text-slate-400 font-bold uppercase">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
