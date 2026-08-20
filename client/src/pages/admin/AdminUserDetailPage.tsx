import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { ArrowLeft, User, Wallet, History, ShoppingBag, ShieldCheck } from 'lucide-react';

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminService
        .getUserDetail(id)
        .then((res) => {
          if (res.data.success) {
            setData(res.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Card className="p-8 text-center text-xs text-slate-500">Loading user details...</Card>;
  if (!data) return <Card className="p-8 text-center text-xs text-slate-500">User not found.</Card>;

  const { user, wallet, transactions, recharges, withdrawals, trades, verification } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/users" className="p-2 bg-brand-surface border border-brand-border rounded-xl text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-100">{user.fullName}</h1>
          <p className="text-xs text-slate-400">{user.email} • ID: {user._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="space-y-4">
          <img src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'} className="w-24 h-24 rounded-2xl object-cover border border-brand-border" />
          <div>
            <h3 className="text-base font-bold text-slate-100">{user.fullName}</h3>
            <p className="text-xs text-slate-400">📍 {user.city} • {user.gender}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-border">
            {user.isVIP && <Badge variant="vip" />}
            {user.status === 'ACTIVE' ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
          </div>
        </Card>

        {/* Wallet Overview */}
        <Card className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" /> Wallet Balance Summary
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-brand-card rounded-xl border border-brand-border">
              <span className="text-[10px] text-slate-400 block uppercase">Available Balance</span>
              <span className="text-lg font-bold text-emerald-400">₹{wallet.availableBalance.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-brand-card rounded-xl border border-brand-border">
              <span className="text-[10px] text-slate-400 block uppercase">Frozen Balance</span>
              <span className="text-lg font-bold text-amber-400">₹{wallet.frozenBalance.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* User Transactions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100">Recent User Transactions</h3>
        {transactions.length === 0 ? (
          <Card className="p-4 text-center text-xs text-slate-500">No transactions recorded.</Card>
        ) : (
          <Table headers={['Tx ID', 'Type', 'Amount', 'Before', 'After', 'Description']}>
            {transactions.map((tx: any) => (
              <tr key={tx._id}>
                <td className="px-4 py-2 font-mono text-xs">{tx.transactionId}</td>
                <td className="px-4 py-2 text-xs">{tx.type}</td>
                <td className="px-4 py-2 font-bold text-amber-400">₹{tx.amount.toFixed(2)}</td>
                <td className="px-4 py-2 text-xs text-slate-400">₹{tx.beforeBalance.toFixed(2)}</td>
                <td className="px-4 py-2 text-xs text-slate-200">₹{tx.afterBalance.toFixed(2)}</td>
                <td className="px-4 py-2 text-xs text-slate-300">{tx.description}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};
