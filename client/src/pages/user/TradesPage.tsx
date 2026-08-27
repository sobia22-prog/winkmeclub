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
  Check,
  Wallet,
  ArrowRight,
  ShieldAlert,
  Flame,
  MoreVertical,
  X,
  Layers,
} from 'lucide-react';

export const TradesPage: React.FC = () => {
  const { wallet, refreshSession } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  // Multi-item selection (up to 2 items at a time)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [tradeQuantity, setTradeQuantity] = useState<number>(1);

  // Right Drawer Slide-over state (opened via 3-dots menu)
  const [showRightDrawer, setShowRightDrawer] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Countdown timer state for Airborne activities round
  const [timeLeft, setTimeLeft] = useState<number>(36);
  const [roundId, setRoundId] = useState<string>('2035029727');

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
          setRoundId(`203502${Math.floor(10000 + Math.random() * 90000)}`);
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

  // Toggle selection of a product (supports selecting up to 2 items at a time)
  const handleToggleSelectProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      if (exists) {
        return prev.filter((p) => p._id === product._id ? false : true);
      } else {
        if (prev.length >= 2) {
          // Replace second item if 2 are already selected
          return [prev[0], product];
        }
        return [...prev, product];
      }
    });
  };

  // Execution of Trade
  const handleExecuteTrade = async () => {
    if (selectedProducts.length === 0) return;
    setError('');
    setSuccess('');

    const itemQty = Number(tradeQuantity) || 1;

    setLoading(true);

    try {
      const combinedNames = selectedProducts.map((p) => p.name).join(' + ');

      const res = await tradeService.executeTrade({
        productId: selectedProducts[0]._id,
        quantity: itemQty,
      });

      if (res.data.success) {
        setSuccess(`Trade #${res.data.trade.tradeId} submitted for Round ${roundId}! (${combinedNames} — Qty: ${itemQty})`);
        setSelectedProducts([]);
        fetchTradeData();
        refreshSession();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Trade execution failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const mainFourProducts = (() => {
    const featured = products.filter((p) => p.isMainPage).slice(0, 4);
    return featured.length > 0 ? featured : products.slice(0, 4);
  })();

  const catalogProducts = products.filter((p) => !mainFourProducts.some((m) => m._id === p._id));

  const selectedProductNames = selectedProducts.map((p) => p.name).join(', ') || 'None selected';
  const totalItemsCount = selectedProducts.length;

  return (
    <div className="w-full space-y-6 pb-40">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link to="/verification" className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-fuchsia-400" /> Trades & Airborne Activities
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Select item(s), enter trading quantity, and confirm round trade</p>
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

      {/* Airborne Activities Round Timer Banner Card (Matching Screenshot 2) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-950 via-purple-900 to-brand-wine border border-fuchsia-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[11px] font-extrabold text-fuchsia-200 uppercase tracking-widest block">Airborne activities</span>
            <span className="text-xl md:text-2xl font-black tracking-wider text-white font-mono">{roundId}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-fuchsia-200 uppercase tracking-widest block">Remaining Time</span>
            <span className="text-xl font-mono font-black text-amber-300 flex items-center gap-2 justify-end">
              <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
              {formatSeconds(timeLeft)}
            </span>
          </div>
        </div>

        {/* Inner Round Badge Box */}
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between text-xs">
          <span className="font-mono font-bold">{roundId}</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white font-extrabold text-[10px]">Round Active</span>
          </div>
        </div>
      </div>

      {/* Main Page Product Grid (ONLY 4 ITEMS SHOWN ON MAIN PAGE + 3-DOTS MENU BUTTON) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" /> Select Trade Activity Items
          </h2>

          {/* 3-DOTS MENU BUTTON (OPENS RIGHT OVERLAY DRAWER TO VIEW & ADD OTHER CATALOG ITEMS) */}
          <button
            type="button"
            onClick={() => setShowRightDrawer(true)}
            className="p-2.5 bg-brand-surface border border-brand-border hover:border-fuchsia-500 rounded-2xl text-slate-200 hover:text-white flex items-center gap-2 text-xs font-bold transition-all shadow-md cursor-pointer"
            title="Open More Products Catalog"
          >
            <span>More Products</span>
            <MoreVertical className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {mainFourProducts.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">Loading main catalog items...</Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {mainFourProducts.map((product) => {
              const isSelected = selectedProducts.some((p) => p._id === product._id);
              return (
                <div
                  key={product._id}
                  onClick={() => handleToggleSelectProduct(product)}
                  className={`relative rounded-3xl p-4 bg-brand-surface border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-center shadow-xl group ${
                    isSelected
                      ? 'border-fuchsia-500 bg-gradient-to-b from-fuchsia-950/50 via-brand-surface to-brand-surface shadow-fuchsia-500/30 scale-[1.02]'
                      : 'border-brand-border hover:border-fuchsia-500/40 hover:bg-brand-card'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-fuchsia-500/40 z-10">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-black/40 p-2 border border-brand-border/60 shadow-inner">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-slate-100 truncate">{product.name}</h3>
                    <p className="text-xs font-black text-amber-400">Quantity: {product.stock || 100}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT OVERLAY DRAWER BAR (Triggered by 3-dots menu button) */}
      {showRightDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs md:max-w-sm h-full bg-brand-surface border-l border-brand-border p-5 flex flex-col justify-between space-y-4 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> Additional Trading Catalog
              </h3>
              <button
                type="button"
                onClick={() => setShowRightDrawer(false)}
                className="p-1.5 bg-brand-card hover:bg-rose-500/20 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Tap any item to add it to your active multi-item trade selection (up to 2 items).
            </p>

            {/* Catalog Items List in Right Overlay */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {catalogProducts.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">All active products are currently shown on the main page.</p>
              ) : (
                catalogProducts.map((product) => {
                const isSelected = selectedProducts.some((p) => p._id === product._id);
                return (
                  <div
                    key={product._id}
                    onClick={() => handleToggleSelectProduct(product)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-fuchsia-500 bg-fuchsia-950/40 text-white'
                        : 'border-brand-border bg-brand-card/50 hover:bg-brand-card text-slate-300'
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-brand-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate">{product.name}</div>
                      <div className="text-[11px] font-bold text-amber-400">Quantity: {product.stock || 100}</div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-fuchsia-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>

            {/* Drawer Close Button */}
            <Button variant="gold" className="w-full" onClick={() => setShowRightDrawer(false)}>
              Done Selecting ({selectedProducts.length} Selected)
            </Button>
          </div>
        </div>
      )}

      {/* TRADE CALCULATION BAR (Floating Bottom Sheet - ONLY SHOWN IF ITEMS SELECTED FOR TRADE) */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 bg-brand-surface/98 backdrop-blur-2xl border-t border-brand-border p-4 md:p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto space-y-3 text-xs">
            {/* Top Row: Current Selection & Total Items Non-Editable Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-brand-border/60">
              <div className="flex items-center gap-2 bg-brand-dark/70 p-2.5 rounded-xl border border-brand-border">
                <span className="text-slate-400 font-semibold shrink-0">Current Selection:</span>
                <span className="font-bold text-fuchsia-400 truncate">{selectedProductNames}</span>
              </div>

              <div className="flex items-center justify-between bg-brand-dark/70 p-2.5 rounded-xl border border-brand-border">
                <span className="text-slate-400 font-semibold">Total Items:</span>
                <span className="font-mono font-bold text-amber-400">{totalItemsCount} item{totalItemsCount === 1 ? '' : 's'} selected</span>
              </div>
            </div>

            {/* Middle Row: Trade Quantity Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Quantity Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Item Trade Quantity
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(Number(e.target.value))}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              {/* Selected Units Summary */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Trade Units
                </label>
                <div className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-3 py-2 text-amber-400 font-mono font-bold">
                  {tradeQuantity} unit{tradeQuantity === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            {/* Bottom Row: Execute Trade Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleExecuteTrade}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-xl shadow-pink-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                {loading ? 'Processing Trade...' : 'Confirm Airborne Trade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trades History Log Table */}
      <div className="space-y-4 pt-6 border-t border-brand-border">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" /> Airborne Trade Log History
        </h2>

        {trades.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">No active round trades placed yet.</Card>
        ) : (
          <Table headers={['Trade ID', 'Item(s)', 'Quantity', 'Status', 'Outcome', 'Date']}>
            {trades.map((t: any) => (
              <tr key={t._id} className="hover:bg-brand-card/50 transition-colors text-xs">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{t.tradeId}</td>
                <td className="px-5 py-3 font-semibold text-slate-100">{t.productName}</td>
                <td className="px-5 py-3 font-bold text-amber-400">
                  {t.quantity || 1} units
                </td>
                <td className="px-5 py-3">
                  {t.status === 'PENDING' ? <Badge variant="pending">PENDING</Badge> : <Badge variant="verified">SETTLED</Badge>}
                </td>
                <td className="px-5 py-3">
                  {t.outcome === 'WIN' && <Badge variant="vip">WIN 🎉</Badge>}
                  {t.outcome === 'LOSE' && <Badge variant="danger">LOSE</Badge>}
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
