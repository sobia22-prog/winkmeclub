import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/wallet.service';
import { Transaction } from '../../types';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { History, Search, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await walletService.getTransactions({ type });
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" /> Transaction Ledger
          </h1>
          <p className="text-xs text-slate-400">Complete audit trail of all financial movements and balance updates.</p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { label: 'All Transactions', value: 'ALL' },
              { label: 'Recharges', value: 'RECHARGE' },
              { label: 'Withdrawals', value: 'WITHDRAWAL' },
              { label: 'Trade Holds', value: 'TRADE_HOLD' },
              { label: 'Trade Wins', value: 'TRADE_WIN' },
              { label: 'Trade Losses', value: 'TRADE_LOSE' },
              { label: 'Admin Adjustments', value: 'ADMIN_ADJUSTMENT' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading ledger data...</Card>
      ) : transactions.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No transaction records found for selected filter.</Card>
      ) : (
        <Table headers={['Transaction ID', 'Type', 'Amount', 'Before Balance', 'After Balance', 'Description', 'Timestamp']}>
          {transactions.map((tx) => (
            <tr key={tx._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3.5 font-mono font-bold text-slate-200">{tx.transactionId}</td>
              <td className="px-5 py-3.5">
                {tx.type === 'RECHARGE' && <Badge variant="success">RECHARGE</Badge>}
                {tx.type === 'WITHDRAWAL' && <Badge variant="danger">WITHDRAWAL</Badge>}
                {tx.type === 'TRADE_HOLD' && <Badge variant="warning">TRADE HOLD</Badge>}
                {tx.type === 'TRADE_WIN' && <Badge variant="vip">TRADE WIN 🎉</Badge>}
                {tx.type === 'TRADE_LOSE' && <Badge variant="danger">TRADE LOSE</Badge>}
                {tx.type === 'ADMIN_ADJUSTMENT' && <Badge variant="neutral">ADMIN ADJUST</Badge>}
              </td>
              <td
                className={`px-5 py-3.5 font-bold ${
                  tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {tx.amount > 0 ? '+' : ''}{currencySymbol}{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3.5 text-slate-400">
                {currencySymbol}{tx.beforeBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3.5 font-semibold text-slate-200">
                {currencySymbol}{tx.afterBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3.5 text-xs text-slate-300 max-w-xs truncate">{tx.description}</td>
              <td className="px-5 py-3.5 text-xs text-slate-500">
                {new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};
