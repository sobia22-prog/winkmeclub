import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tradeService } from '../../services/trade.service';
import { Product, Trade } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { ShoppingBag, TrendingUp, History, CheckCircle2, ShieldAlert, Crown, ArrowRight, ShieldCheck } from 'lucide-react';

export const TradesPage: React.FC = () => {
  const { user, wallet, refreshSession } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTradeData = async () => {
    try {
      const [prodRes, trdRes] = await Promise.all([
        tradeService.getProducts(),
        tradeService.getMyTrades(),
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.products);
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

  const handleExecuteTrade = async () => {
    if (!selectedProduct) return;
    setError('');
    setLoading(true);

    try {
      const res = await tradeService.executeTrade({
        productId: selectedProduct._id,
        quantity,
      });

      if (res.data.success) {
        setSuccess(`Trade #${res.data.trade.tradeId} submitted successfully! Balance held in frozen state.`);
        setSelectedProduct(null);
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

  // If Non-VIP Member, render VIP Gate Screen
  if (!isVIPMember) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-amber-950/40 via-brand-surface to-brand-surface border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Crown className="w-8 h-8 fill-amber-400" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl font-extrabold text-slate-100">VIP Exclusive Feature</h1>
            <h2 className="text-sm font-bold text-amber-400">Product Trading Marketplace</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Product trading activities and admin settlement outcomes are reserved exclusively for Verified Gold VIP Members. Complete identity verification to unlock trading privileges.
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" /> Product Trading Marketplace
          </h1>
          <p className="text-xs text-slate-400">Trade lifestyle products & participate in admin-settled position holds.</p>
        </div>

        <Badge variant="vip" size="md" />
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
          </div>
          <button onClick={() => setSuccess('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Available Products Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-100">Available Lifestyle Products for Trade</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((product) => (
            <Card key={product._id} hoverEffect className="p-0 overflow-hidden flex flex-col justify-between group">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-400 border border-amber-500/30">
                  {product.category}
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 italic">{product.description}</p>
                </div>

                <div className="pt-2 border-t border-brand-border flex items-center justify-between">
                  <span className="text-base font-extrabold text-amber-400">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Trade Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Trades Ledger */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" /> Your Active Trades & Outcomes
        </h2>

        {trades.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">No active or past trades recorded.</Card>
        ) : (
          <Table headers={['Trade ID', 'Product', 'Quantity', 'Amount (₹)', 'Status', 'Outcome', 'Submitted']}>
            {trades.map((t) => (
              <tr key={t._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3.5 font-mono font-bold text-slate-200">{t.tradeId}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-100">{t.productName}</td>
                <td className="px-5 py-3.5 text-slate-400">{t.quantity}</td>
                <td className="px-5 py-3.5 font-bold text-amber-400">
                  ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3.5">
                  {t.status === 'PENDING' ? <Badge variant="pending">HOLDING</Badge> : <Badge variant="verified">SETTLED</Badge>}
                </td>
                <td className="px-5 py-3.5">
                  {t.outcome === 'WIN' && <Badge variant="vip">WIN 🎉</Badge>}
                  {t.outcome === 'LOSE' && <Badge variant="danger">LOSE</Badge>}
                  {t.outcome === 'NONE' && <span className="text-xs text-slate-500">Pending Review</span>}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Execute Trade Modal */}
      {selectedProduct && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          title={`Execute Trade — ${selectedProduct.name}`}
        >
          <div className="space-y-4">
            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

            <div className="flex items-center gap-4 p-3 bg-brand-card border border-brand-border rounded-2xl">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">{selectedProduct.name}</h4>
                <p className="text-xs text-amber-400 font-bold">Unit Price: ₹{selectedProduct.price.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="w-4 h-4" /> Financial Frozen Hold Warning
              </div>
              <p>Executing this trade will hold ₹{(selectedProduct.price * quantity).toLocaleString('en-IN')} into your frozen balance until settled by administration.</p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <Button variant="secondary" onClick={() => setSelectedProduct(null)} type="button">
                Cancel
              </Button>
              <Button variant="gold" onClick={handleExecuteTrade} isLoading={loading}>
                Confirm & Hold Balance
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
