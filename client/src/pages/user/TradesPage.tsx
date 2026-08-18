import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tradeService } from '../../services/trade.service';
import { Product, Trade } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import {
  ShoppingBag,
  TrendingUp,
  History,
  CheckCircle2,
  ShieldAlert,
  Crown,
  ArrowRight,
  ShieldCheck,
  Clock,
  ChevronLeft,
  Plus,
  Minus,
  Check,
} from 'lucide-react';

export const TradesPage: React.FC = () => {
  const { user, wallet, refreshSession } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        // Default select first product
        setSelectedProduct(prodRes.data.products[0]);
      }
      if (trdRes.data.success) setTrades(trdRes.data.trades);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.isVIP || user?.verificationStatus === 'VERIFIED') {
      fetchTradeData();
    }
  }, [user]);

  // Round Timer Countdown Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Reset round timer and increment round ID
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

  const handleExecuteTrade = async () => {
    if (!selectedProduct) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await tradeService.executeTrade({
        productId: selectedProduct._id,
        quantity,
      });

      if (res.data.success) {
        setSuccess(`Trade #${res.data.trade.tradeId} submitted for Round ${roundId}! ₹${(selectedProduct.price * quantity).toLocaleString('en-IN')} held in frozen state.`);
        setQuantity(1);
        fetchTradeData();
        refreshSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Trade execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const isVIPMember = user?.isVIP || user?.verificationStatus === 'VERIFIED';

  // If Non-VIP Member, render VIP Access Gate Screen
  if (!isVIPMember) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-amber-950/40 via-brand-surface to-brand-surface border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Crown className="w-8 h-8 fill-amber-400" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl font-extrabold text-slate-100">VIP Exclusive Feature</h1>
            <h2 className="text-sm font-bold text-amber-400">Airborne Activities & Product Trading</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Product trading activities and round settlement outcomes are reserved exclusively for Verified Gold VIP Members. Complete identity verification to unlock trading privileges.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/verification">
              <Button
                variant="gold"
                size="md"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Verified & Unlock VIP Trading
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availableBalance = wallet?.availableBalance ?? 0;
  const totalAmount = selectedProduct ? selectedProduct.price * quantity : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      {/* Header Bar matching Reference UI */}
      <div className="flex items-center justify-between pb-2 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Link to="/profile" className="p-1.5 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-extrabold text-slate-100">Airborne activities</h1>
        </div>

        <Badge variant="vip" size="sm" />
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
          </div>
          <button onClick={() => setSuccess('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Round & Timer Banner Card matching exact reference pink/purple gradient styling */}
      <div className="bg-gradient-to-r from-fuchsia-900/90 via-purple-900 to-brand-wine border border-fuchsia-500/40 rounded-3xl p-5 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-fuchsia-200 block">Current Active Round</span>
            <span className="text-lg font-black tracking-wide text-white">{roundId}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-fuchsia-200 block">Remaining time:</span>
            <span className="text-lg font-mono font-black text-amber-300 flex items-center gap-1.5 justify-end">
              <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
              {formatSeconds(timeLeft)}
            </span>
          </div>
        </div>

        {/* Previous Round Outcome Badges */}
        <div className="pt-2 border-t border-fuchsia-500/30 flex items-center justify-between">
          <span className="text-[11px] font-bold text-fuchsia-200">20260730381 Round Outcome</span>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-indigo-400 shadow">
              7
            </span>
            <span className="w-7 h-7 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center border border-pink-400 shadow">
              B
            </span>
            <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center border border-purple-400 shadow">
              C
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid (2x2 matching exact phone reference screenshots) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Activity Item</h2>

        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => {
            const isSelected = selectedProduct?._id === product._id;
            return (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className={`relative rounded-3xl p-4 bg-brand-surface border-2 transition-all cursor-pointer flex flex-col items-center justify-between gap-3 text-center shadow-lg group ${
                  isSelected
                    ? 'border-fuchsia-500 bg-gradient-to-b from-fuchsia-950/40 to-brand-surface shadow-fuchsia-500/20 scale-[1.02]'
                    : 'border-brand-border hover:border-fuchsia-500/40 hover:bg-brand-card'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-fuchsia-500 text-white flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-card p-2 border border-brand-border">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-100">{product.name}</h3>
                  <p className="text-xs font-black text-rose-500">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Trade Controls Drawer matching reference UI */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-xl border-t border-brand-border p-4 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Details Column */}
          <div className="space-y-1 text-xs">
            <div className="text-slate-300">
              <span className="text-slate-400">Current Selection: </span>
              <strong className="text-fuchsia-400 font-extrabold">{selectedProduct?.name || 'None'}</strong>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-0.5">
              <span className="text-slate-400">Quantity:</span>
              <div className="inline-flex items-center border border-brand-border rounded-xl bg-brand-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-brand-surface transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 font-mono font-bold text-slate-100">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-brand-surface transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-0.5">
              Total {quantity} Ticket: <strong className="text-amber-400 font-bold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              {' | '}
              Available Points: <strong className="text-emerald-400 font-bold">₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          {/* Confirm Button matching purple gradient reference */}
          <button
            type="button"
            onClick={handleExecuteTrade}
            disabled={loading || !selectedProduct}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>

      {/* Trades History Table */}
      <div className="space-y-3 pt-4 border-t border-brand-border">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" /> Airborne Trade Log
        </h2>

        {trades.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500">No active round trades placed yet.</Card>
        ) : (
          <Table headers={['Trade ID', 'Item', 'Qty', 'Total (₹)', 'Status', 'Outcome', 'Date']}>
            {trades.map((t) => (
              <tr key={t._id} className="hover:bg-brand-card/50 transition-colors text-xs">
                <td className="px-4 py-3 font-mono font-bold text-slate-200">{t.tradeId}</td>
                <td className="px-4 py-3 font-semibold text-slate-100">{t.productName}</td>
                <td className="px-4 py-3 text-slate-400">{t.quantity}</td>
                <td className="px-4 py-3 font-bold text-amber-400">
                  ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  {t.status === 'PENDING' ? <Badge variant="pending">HOLDING</Badge> : <Badge variant="verified">SETTLED</Badge>}
                </td>
                <td className="px-4 py-3">
                  {t.outcome === 'WIN' && <Badge variant="vip">WIN 🎉</Badge>}
                  {t.outcome === 'LOSE' && <Badge variant="danger">LOSE</Badge>}
                  {t.outcome === 'NONE' && <span className="text-[11px] text-slate-500">In Round</span>}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};
