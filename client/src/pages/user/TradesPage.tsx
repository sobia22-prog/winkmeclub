import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tradeService } from '../../services/trade.service';
import { Product, Trade } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
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
  Eye,
} from 'lucide-react';

export const TradesPage: React.FC = () => {
  const { wallet, refreshSession } = useAuth();
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';
  const [products, setProducts] = useState<Product[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  // Multi-item selection (up to 2 items at a time)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [tradeQuantity, setTradeQuantity] = useState<number | string>(0);

  // Right Drawer Slide-over state (opened via 3-dots menu)
  const [showRightDrawer, setShowRightDrawer] = useState<boolean>(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

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

    const itemQty = Number(tradeQuantity);
    if (!tradeQuantity || isNaN(itemQty) || itemQty <= 0) {
      setError('Please enter a valid trade balance quantity before placing your trade.');
      return;
    }

    const available = wallet?.availableBalance || 0;
    if (itemQty > available) {
      setError(`Insufficient available balance for this trade. Required: ${currencySymbol}${itemQty}, Available: ${currencySymbol}${available.toFixed(2)}.`);
      return;
    }

    setLoading(true);

    try {
      const combinedNames = selectedProducts.map((p) => p.name).join(' + ');

      const res = await tradeService.executeTrade({
        productId: selectedProducts[0]._id,
        productName: combinedNames,
        productImage: selectedProducts[0].image,
        quantity: itemQty,
      });

      if (res.data.success) {
        setSuccess(`Trade #${res.data.trade.tradeId} submitted for Round ${roundId}! (${combinedNames} — Qty: ${itemQty})`);
        setSelectedProducts([]);
        setTradeQuantity(0);
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

  // Gradual scroll reveal state (starts at 4 products)
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

  // IntersectionObserver to automatically load 4 more products when user scrolls near bottom
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < products.length) {
              return Math.min(prev + 4, products.length);
            }
            return prev;
          });
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [products.length, visibleCount]);

  const displayedProducts = products.slice(0, visibleCount);
  const catalogProducts = products; // Keep all catalog items in 3-dots drawer menu

  const selectedProductNames = selectedProducts.map((p) => p.name).join(', ') || 'None selected';
  const totalItemsCount = selectedProducts.length;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/verification" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-pink-600" /> Trades & Airborne Activities
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Select item(s), enter trading quantity, and confirm round trade</p>
          </div>
        </div>

        <Badge variant="vip" size="sm" />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> {success}
          </div>
          <button onClick={() => setSuccess('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Airborne Activities Round Timer Banner Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 border border-pink-400/30 rounded-3xl p-6 text-white shadow-xl space-y-4">
        {/* Top bar inside the card with Back and More Options */}
        <div className="flex items-center justify-between relative z-10 w-full mb-2">
          <Link to="/verification" className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-md transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>
          <span className="text-sm font-extrabold text-white">Airborne activities</span>
          <button
            type="button"
            onClick={() => setShowRightDrawer(true)}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-md transition-colors"
            title="Open More Products Catalog"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
               <span className="font-bold text-white text-xs">{wallet?.user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <span className="text-xl md:text-2xl font-black tracking-wider text-white font-mono">{roundId}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-bold text-pink-100 uppercase tracking-widest block">REMAINING TIME</span>
            <span className="text-sm font-mono font-black text-white flex items-center justify-end">
              {formatSeconds(timeLeft)}
            </span>
          </div>
        </div>

        {/* Inner Round Badge Box */}
        <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-between text-xs text-white">
          <span className="font-mono font-bold">{roundId}</span>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-pink-700 font-black text-[10px] shadow-sm">Round Active</span>
          </div>
        </div>
      </div>

      {/* Product Sections (Main Lobby vs Hidden Products) */}
      {(() => {
        // 1. Lobby Products: Designated LOBBY products by admin (max 4 cards, 2 per row)
        const lobbyProducts = products
          .filter((p) => {
            if (p.sectionType) return p.sectionType === 'LOBBY';
            return p.isMainPage === true;
          })
          .slice(0, 4);

        const lobbyIds = new Set(lobbyProducts.map((p) => p._id));

        // 2. Hidden Products: All other products strictly EXCLUDING lobbyProducts (zero overlap)
        const hiddenProducts = products.filter((p) => !lobbyIds.has(p._id));

        return (
          <>
            {/* Main Lobby Products Section */}
            <div className="space-y-3 pt-2">

              {lobbyProducts.length === 0 ? (
                <Card className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200">No lobby trade items selected by admin.</Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                  {lobbyProducts.map((product) => {
                    const isSelected = selectedProducts.some((p) => p._id === product._id);
                    return (
                      <div
                        key={product._id}
                        onClick={() => handleToggleSelectProduct(product)}
                        className={`relative rounded-2xl p-2.5 sm:p-3 bg-white border-2 transition-all cursor-pointer flex flex-col justify-between items-center shadow-sm group overflow-hidden ${
                          isSelected
                            ? 'border-pink-600 bg-pink-50/40 shadow-md scale-[1.02]'
                            : 'border-slate-200 hover:border-pink-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-md z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="w-full h-28 sm:h-36 md:h-40 rounded-xl overflow-hidden bg-slate-100 p-1 border border-slate-200 shadow-inner">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-900 truncate text-center mt-2 w-full px-1">
                          {product.name}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* INLINE CONFIRM AIRBORNE TRADE BOX (Appears below products before trade history) */}
              {selectedProducts.length > 0 && (
                <div className="mt-4 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* Header & Clear Button */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-pink-600" /> Confirm Airborne Trade
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProducts([])}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      title="Clear Selection"
                    >
                      Clear <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Top Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-slate-600 font-semibold">Available Balance:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {currencySymbol}{(wallet?.availableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 gap-2">
                      <span className="text-slate-600 font-semibold shrink-0">Current Selection:</span>
                      <span className="font-bold text-pink-600 truncate">{selectedProductNames}</span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-slate-600 font-semibold">Total Items:</span>
                      <span className="font-mono font-bold text-pink-600">{totalItemsCount} item{totalItemsCount === 1 ? '' : 's'} selected</span>
                    </div>
                  </div>

                  {/* Middle Row: Quantity & Tickets */}
                  <div className="grid grid-cols-2 gap-4 items-center text-xs">
                    {/* Quantity Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={tradeQuantity}
                        onChange={(e) => setTradeQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-900 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                        placeholder="0"
                      />
                    </div>

                    {/* Tickets Summary */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Tickets
                      </label>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-pink-600 font-mono font-bold text-xs sm:text-sm">
                        {tradeQuantity || 0}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row - Confirm Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleExecuteTrade}
                      disabled={loading || !tradeQuantity || Number(tradeQuantity) <= 0 || Number(tradeQuantity) > (wallet?.availableBalance || 0)}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {loading ? 'Processing Trade...' : 'Confirm Airborne Trade'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT OVERLAY DRAWER BAR (Contains ONLY Hidden Products) */}
            {showRightDrawer && (
              <div 
                className="fixed inset-0 z-[70] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setShowRightDrawer(false)}
              >
                <div 
                  className="w-full max-w-[280px] sm:max-w-xs md:max-w-sm h-full bg-white border-l border-slate-200 p-4 sm:p-6 flex flex-col space-y-4 shadow-2xl animate-in slide-in-from-right duration-300 rounded-l-[2rem]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer Header */}
                  <div className="pt-2 pb-1">
                    <h3 className="text-sm font-bold text-purple-600 tracking-[0.2em] uppercase pl-1">
                      More Products
                    </h3>
                  </div>

                  {/* Catalog Items List in Right Overlay */}
                  <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 pb-20 custom-scrollbar">
                    {hiddenProducts.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-6">No hidden products available.</p>
                    ) : (
                      hiddenProducts.map((product) => {
                        const isSelected = selectedProducts.some((p) => p._id === product._id);

                        return (
                          <div
                            key={product._id}
                            onClick={() => handleToggleSelectProduct(product)}
                            className={`relative flex items-center gap-4 p-2 sm:p-2.5 rounded-full border transition-all cursor-pointer bg-white ${
                              isSelected
                                ? 'border-purple-500 shadow-md ring-1 ring-purple-200'
                                : 'border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
                            }`}
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 truncate pr-4 flex-1">
                              {product.name}
                            </h4>
                            
                            {isSelected && (
                              <div className="absolute right-3 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Trades History Log Table */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-pink-600" /> Airborne Trade Log History
        </h2>

        {trades.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200">No active round trades placed yet.</Card>
        ) : (
          <Table headers={['Trade ID', 'Item(s)', 'Quantity / Amount', 'Status', 'Outcome & Profit', 'Payout Credited', 'Date']}>
            {trades.map((t: any) => {
              const isWin = t.outcome === 'WIN';
              const isLose = t.outcome === 'LOSE';
              const profitPct = t.profitPercentage ?? 20;
              const payout = t.payoutAmount || (isWin ? t.totalAmount * (1 + profitPct / 100) : 0);

              return (
                <tr key={t._id} className="hover:bg-slate-50 transition-colors text-xs">
                  <td className="px-5 py-3 font-mono font-bold text-slate-900">{t.tradeId}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{t.productName}</td>
                  <td className="px-5 py-3 font-bold text-pink-600 font-mono">
                    {currencySymbol}{t.quantity || 0}
                  </td>
                  <td className="px-5 py-3">
                    {t.status === 'PENDING' ? <Badge variant="pending">PENDING</Badge> : <Badge variant="verified">SETTLED</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    {isWin && <Badge variant="vip">WIN 🎉 (+{profitPct}%)</Badge>}
                    {isLose && <Badge variant="danger">LOSE (-100%)</Badge>}
                    {!isWin && !isLose && <span className="text-[11px] text-slate-500 font-semibold">In Round</span>}
                  </td>
                  <td className="px-5 py-3 font-mono font-black text-xs">
                    {isWin && <span className="text-emerald-600">+{currencySymbol}{payout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>}
                    {isLose && <span className="text-rose-600">-</span>}
                    {!isWin && !isLose && <span className="text-amber-600">Held in Frozen</span>}
                  </td>
                  <td className="px-5 py-3 text-[11px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </div>
  );
};
