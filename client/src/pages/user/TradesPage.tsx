import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tradeService } from '../../services/trade.service';
import { Product, Trade } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import {
  ShoppingBag,
  History,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Plus,
  Minus,
  Check,
  Wallet,
  ArrowRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export const TradesPage: React.FC = () => {
  const { wallet, refreshSession } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Insufficient Balance Modal State
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState(0);

  // Countdown timer state for Airborne activities round
  const [timeLeft, setTimeLeft] = useState<number>(36);
  const [roundId, setRoundId] = useState<string>('20260730382');

  const fetchTradeData = async () => {
    try {
      const [prodRes, trdRes] = await Promise.all([
        tradeService.getProducts(),
        tradeService.getMyTrades(),
      ]);
      if (prodRes.data.success && prodRes.data.products.length > 0) {
        setProducts(prodRes.data.products);
      }
      if (trdRes.data.success) setTrades(trdRes.data.trades);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTradeData();
  }, []);

  // Round Timer Countdown Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRoundId(`2026073${Math.floor(1000 + Math.random() * 9000)}`);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `00:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const availableBalance = wallet?.availableBalance ?? 0;
  const totalAmount = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleExecuteTrade = async () => {
    if (!selectedProduct) return;
    setError('');
    setSuccess('');

    // Check balance client-side first
    if (availableBalance < totalAmount) {
      setRequiredAmount(totalAmount);
      setShowInsufficientBalanceModal(true);
      return;
    }

    setLoading(true);

    try {
      const res = await tradeService.executeTrade({
        productId: selectedProduct._id,
        quantity,
      });

      if (res.data.success) {
        setSuccess(`Trade #${res.data.trade.tradeId} submitted for Round ${roundId}! ₹${totalAmount.toLocaleString('en-IN')} submitted.`);
        setQuantity(1);
        fetchTradeData();
        refreshSession();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Trade execution failed.';
      if (msg.toLowerCase().includes('insufficient')) {
        setRequiredAmount(totalAmount);
        setShowInsufficientBalanceModal(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-32">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-fuchsia-400" /> Airborne Product Trade
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Select item, choose quantity, and place Airborne round trade</p>
          </div>
        </div>

        <Badge variant="vip" size="sm" />
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-between shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {success}
          </div>
          <button onClick={() => setSuccess('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Round & Timer Banner Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-950 via-purple-900 to-brand-wine border border-fuchsia-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-4">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[11px] font-bold text-fuchsia-200 uppercase tracking-widest block">Current Active Round</span>
            <span className="text-xl md:text-2xl font-black tracking-wider text-white font-mono">{roundId}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-fuchsia-200 uppercase tracking-widest block">Remaining Round Time</span>
            <span className="text-xl font-mono font-black text-amber-300 flex items-center gap-2 justify-end">
              <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
              {formatSeconds(timeLeft)}
            </span>
          </div>
        </div>

        {/* Previous Round Outcome Badges */}
        <div className="pt-3 border-t border-fuchsia-500/30 flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-fuchsia-200">Previous Round Result</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center border border-indigo-400 shadow-md">
              7
            </span>
            <span className="w-8 h-8 rounded-full bg-pink-600 text-white font-black text-xs flex items-center justify-center border border-pink-400 shadow-md">
              B
            </span>
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center border border-purple-400 shadow-md">
              C
            </span>
          </div>
        </div>
      </div>

      {/* Select Activity Item Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" /> Select Trade Activity Item
          </h2>
          <span className="text-xs text-slate-400 font-semibold">{products.length} Products Available</span>
        </div>

        {products.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">Loading catalog items...</Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const isSelected = selectedProduct?._id === product._id;
              return (
                <div
                  key={product._id}
                  onClick={() => setSelectedProduct(product)}
                  className={`relative rounded-3xl p-5 bg-brand-surface border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 text-center shadow-xl group ${
                    isSelected
                      ? 'border-fuchsia-500 bg-gradient-to-b from-fuchsia-950/40 via-brand-surface to-brand-surface shadow-fuchsia-500/30 scale-[1.02]'
                      : 'border-brand-border hover:border-fuchsia-500/40 hover:bg-brand-card'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-fuchsia-500/40">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden bg-black/40 p-2 border border-brand-border/60 shadow-inner">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2.5 py-0.5 rounded-full bg-brand-card border border-brand-border inline-block">
                      {product.category || 'Trading Item'}
                    </span>
                    <h3 className="text-sm font-black text-slate-100">{product.name}</h3>
                    <p className="text-base font-black text-amber-400">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insufficient Balance Popup Modal */}
      {showInsufficientBalanceModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowInsufficientBalanceModal(false)}
          title="⚠️ Insufficient Available Balance"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100">Deposit Funds to Place Trade</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Your current Available Balance is <strong className="text-emerald-400">₹{availableBalance.toFixed(2)}</strong>. You need <strong className="text-amber-400">₹{requiredAmount.toFixed(2)}</strong> to place this trade.
              </p>
            </div>

            <div className="p-4 bg-brand-card border border-brand-border rounded-2xl text-left space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Required Amount:</span>
                <span className="font-bold text-slate-100">₹{requiredAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Balance:</span>
                <span className="font-bold text-emerald-400">₹{availableBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowInsufficientBalanceModal(false)}>
                Cancel
              </Button>
              <Link to="/wallet">
                <Button variant="gold" leftIcon={<Wallet className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Deposit Funds Now
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Floating Bottom Trade Controls Drawer (Only appears when an item is selected) */}
      {selectedProduct && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 bg-brand-surface/95 backdrop-blur-2xl border-t border-brand-border p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="w-full px-2 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Details Column */}
            <div className="space-y-1 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-400">Selection: </span>
                <strong className="text-fuchsia-400 font-extrabold">{selectedProduct.name}</strong>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 pt-0.5">
                <span className="text-slate-400 font-bold">Qty:</span>
                <div className="inline-flex items-center border border-brand-border rounded-xl bg-brand-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-brand-surface transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 font-mono font-black text-slate-100">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-brand-surface transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-0.5 flex items-center gap-3">
                <span>Cost: <strong className="text-amber-400 font-bold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                <span>Available: <strong className="text-emerald-400 font-bold">₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleExecuteTrade}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-pink-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {loading ? 'Processing...' : 'Confirm Trade'}
            </button>
          </div>
        </div>
      )}

      {/* Trades History Table */}
      <div className="space-y-4 pt-6 border-t border-brand-border">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" /> Airborne Trade Log History
        </h2>

        {trades.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">No active round trades placed yet.</Card>
        ) : (
          <Table headers={['Trade ID', 'Item', 'Qty', 'Total (₹)', 'Status', 'Outcome', 'Date']}>
            {trades.map((t: any) => (
              <tr key={t._id} className="hover:bg-brand-card/50 transition-colors text-xs">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{t.tradeId}</td>
                <td className="px-5 py-3 font-semibold text-slate-100">{t.productName}</td>
                <td className="px-4 py-3 text-slate-300 font-medium">x{t.quantity}</td>
                <td className="px-5 py-3 font-bold text-amber-400">
                  ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3">
                  {t.status === 'PENDING' ? <Badge variant="pending">PENDING</Badge> : <Badge variant="verified">SETTLED</Badge>}
                </td>
                <td className="px-5 py-3">
                  {t.outcome === 'WIN' && <Badge variant="vip">WIN 🎉 (+{t.profitPercentage || 20}%)</Badge>}
                  {t.outcome === 'LOSE' && <Badge variant="danger">LOSE (FROZEN)</Badge>}
                  {t.outcome === 'NONE' && <span className="text-[11px] text-slate-500 font-semibold">In Round</span>}
                </td>
                <td className="px-5 py-3 text-[11px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};
