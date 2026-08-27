import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { walletService } from '../../services/wallet.service';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { History } from 'lucide-react';

export const AdminTransactionsPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletService
      .getTransactions({ limit: 100 })
      .then((res) => {
        if (res.data.success) {
          setTransactions(res.data.transactions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-purple-400" /> Platform Transaction Ledger
        </h1>
        <p className="text-xs text-slate-400">Master audit trail of all financial movements across all accounts.</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading master ledger...</Card>
      ) : (
        <Table headers={['Tx ID', 'User ID', 'Type', 'Amount', 'Before Balance', 'After Balance', 'Description', 'Date']}>
          {transactions.map((tx) => (
            <tr key={tx._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-mono font-bold text-slate-200">{tx.transactionId}</td>
              <td className="px-5 py-3 font-mono text-xs text-slate-400">{tx.userId}</td>
              <td className="px-5 py-3">
                <Badge variant="neutral" size="sm">
                  {tx.type}
                </Badge>
              </td>
              <td className="px-5 py-3 font-bold text-amber-400">
                {currencySymbol}{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3 text-slate-400">{currencySymbol}{tx.beforeBalance.toFixed(2)}</td>
              <td className="px-5 py-3 font-semibold text-slate-200">{currencySymbol}{tx.afterBalance.toFixed(2)}</td>
              <td className="px-5 py-3 text-xs text-slate-300 max-w-xs truncate">{tx.description}</td>
              <td className="px-5 py-3 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};
