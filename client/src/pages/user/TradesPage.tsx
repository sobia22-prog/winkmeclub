import React, { useState, useEffect } from 'react';
import { tradeService } from '../../services/trade.service';
import { Product, Trade } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { ShoppingBag, TrendingUp, History, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export const TradesPage: React.FC = () => {
  const { wallet, refreshSession } = useAuth();
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
    fetchTradeData();
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-wine" /> Product Trading Marketplace
          </h1>
          <p className="text-xs text-slate-400">Trade exclusive luxury products with admin settlement controls.</p>
        </div>

        <div className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs flex items-center gap-3">
          <span className="text-slate-400">Available Balance:</span>
          <span className="font-bold text-emerald-400">
            ₹{wallet?.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </span>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {/* Available Products Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Featured Active Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id} hoverEffect className="p-0 overflow-hidden flex flex-col justify-between">
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-200 rounded-full border border-white/10 uppercase">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description}</p>
                </div>

                <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Trade Price</span>
                    <span className="text-lg font-extrabold text-amber-400">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<TrendingUp className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setError('');
                      setSelectedProduct(product);
                      setQuantity(1);
                    }}
                  >
                    Execute Trade
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* User Trade History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-400" /> Your Trade History & Settlements
        </h2>

        {trades.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">No trades executed yet.</Card>
        ) : (
          <Table headers={['Trade ID', 'Product', 'Qty', 'Total Amount', 'Status', 'Outcome', 'Payout', 'Date']}>
            {trades.map((trd) => (
              <tr key={trd._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{trd.tradeId}</td>
                <td className="px-5 py-3 font-semibold text-slate-200">{trd.productName}</td>
                <td className="px-5 py-3 text-slate-300">x{trd.quantity}</td>
                <td className="px-5 py-3 font-bold text-slate-100">
                  ₹{trd.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3">
                  {trd.status === 'SETTLED' ? <Badge variant="neutral">SETTLED</Badge> : <Badge variant="pending">PENDING</Badge>}
                </td>
                <td className="px-5 py-3">
                  {trd.outcome === 'WIN' && <Badge variant="success">WIN 🎉</Badge>}
                  {trd.outcome === 'LOSE' && <Badge variant="danger">LOSE</Badge>}
                  {trd.outcome === 'NONE' && <Badge variant="warning">UNDER REVIEW</Badge>}
                </td>
                <td className="px-5 py-3 font-bold text-emerald-400">
                  {trd.payoutAmount ? `+₹${trd.payoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {new Date(trd.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Execute Trade Modal */}
      {selectedProduct && (
        <Modal isOpen={true} onClose={() => setSelectedProduct(null)} title={`Confirm Trade — ${selectedProduct.name}`}>
          <div className="space-y-4">
            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

            <div className="flex gap-4 p-3 bg-brand-card border border-brand-border rounded-xl">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">{selectedProduct.name}</h4>
                <p className="text-xs text-amber-400 font-bold mt-1">
                  ₹{selectedProduct.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} per unit
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border text-slate-200 font-bold hover:bg-slate-800"
                >
                  -
                </button>
                <span className="text-base font-bold text-slate-100 px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border text-slate-200 font-bold hover:bg-slate-800"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-4 bg-brand-surface border border-brand-border rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Unit Price</span>
                <span>₹{selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Quantity</span>
                <span>x{quantity}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-100 pt-2 border-t border-brand-border">
                <span>Total Trade Hold</span>
                <span className="text-amber-400">
                  ₹{(selectedProduct.price * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Submitting this trade will hold ₹{(selectedProduct.price * quantity).toFixed(2)} from your available balance into frozen balance until outcome settlement.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleExecuteTrade} isLoading={loading} leftIcon={<TrendingUp className="w-4 h-4" />}>
                Confirm Trade Execution
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
