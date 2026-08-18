import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { User } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Users, Search, DollarSign, ShieldAlert, Eye, UserCheck, UserX } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [isVIP, setIsVIP] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Balance Adjustment Modal State
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [balanceForm, setBalanceForm] = useState({
    action: 'ADD' as 'ADD' | 'FREEZE' | 'UNFREEZE' | 'DEDUCT',
    amount: 1000,
    reason: 'Admin operational credit adjustment',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search, status, isVIP });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [status, isVIP]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    setActionLoading(true);

    try {
      const res = await adminService.adjustUserBalance(selectedUserForBalance.id || selectedUserForBalance._id!, balanceForm);
      if (res.data.success) {
        setMessage(`Balance updated successfully!`);
        setSelectedUserForBalance(null);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to adjust balance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (window.confirm(`Are you sure you want to change ${user.fullName}'s status to ${newStatus}?`)) {
      await adminService.toggleUserStatus(user.id || user._id!, { status: newStatus });
      fetchUsers();
    }
  };

  const handleToggleVIP = async (user: User) => {
    const newVIP = !user.isVIP;
    await adminService.toggleUserStatus(user.id || user._id!, { isVIP: newVIP });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" /> Platform User Management
          </h1>
          <p className="text-xs text-slate-400">Search directory, inspect user wallets, manage VIP badges, & adjust balances.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400">{message}</div>
      )}

      {/* Filter Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <Input
            placeholder="Search name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            label=""
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active Only', value: 'ACTIVE' },
              { label: 'Suspended Only', value: 'SUSPENDED' },
            ]}
          />

          <Select
            label=""
            value={isVIP}
            onChange={(e) => setIsVIP(e.target.value)}
            options={[
              { label: 'All Users (VIP & Normal)', value: 'ALL' },
              { label: 'VIP Members Only', value: 'VIP' },
              { label: 'Normal Members Only', value: 'NON_VIP' },
            ]}
          />
        </form>
      </Card>

      {/* User Table */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading user directory...</Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No users match the search criteria.</Card>
      ) : (
        <Table headers={['User', 'City', 'Status', 'VIP', 'Available', 'Frozen', 'Total', 'Actions']}>
          {users.map((u) => {
            const userIdStr = u.id || u._id!;
            return (
              <tr key={userIdStr} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={u.fullName}
                      className="w-9 h-9 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{u.fullName}</h4>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-slate-300">{u.city}</td>
                <td className="px-5 py-3">
                  {u.status === 'ACTIVE' ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => handleToggleVIP(u)}>
                    {u.isVIP ? <Badge variant="vip" size="sm" /> : <Badge variant="neutral" size="sm">TOGGLE VIP</Badge>}
                  </button>
                </td>
                <td className="px-5 py-3 font-bold text-emerald-400">
                  ₹{u.wallet?.availableBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </td>
                <td className="px-5 py-3 text-amber-400 font-semibold">
                  ₹{u.wallet?.frozenBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </td>
                <td className="px-5 py-3 font-bold text-slate-100">
                  ₹{u.wallet?.totalBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/users/${userIdStr}`}>
                      <button title="View Detail" className="p-1.5 bg-brand-surface border border-brand-border rounded-lg text-slate-300 hover:text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button
                      title="Adjust Balance"
                      onClick={() => setSelectedUserForBalance(u)}
                      className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Toggle Suspend"
                      onClick={() => handleToggleStatus(u)}
                      className={`p-1.5 rounded-lg border ${
                        u.status === 'ACTIVE' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}

      {/* Adjust Balance Modal */}
      {selectedUserForBalance && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUserForBalance(null)}
          title={`Adjust Balance — ${selectedUserForBalance.fullName}`}
        >
          <form onSubmit={handleBalanceSubmit} className="space-y-4">
            <Select
              label="Action Type"
              value={balanceForm.action}
              onChange={(e: any) => setBalanceForm({ ...balanceForm, action: e.target.value })}
              options={[
                { label: 'Add Funds (Credit Available Balance)', value: 'ADD' },
                { label: 'Freeze Funds (Move Available -> Frozen)', value: 'FREEZE' },
                { label: 'Unfreeze Funds (Move Frozen -> Available)', value: 'UNFREEZE' },
                { label: 'Deduct Funds (Direct Debit)', value: 'DEDUCT' },
              ]}
            />

            <Input
              label="Amount (₹)"
              type="number"
              value={balanceForm.amount}
              onChange={(e) => setBalanceForm({ ...balanceForm, amount: Number(e.target.value) })}
              min={1}
              required
            />

            <Input
              label="Administrative Reason / Audit Note"
              value={balanceForm.reason}
              onChange={(e) => setBalanceForm({ ...balanceForm, reason: e.target.value })}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedUserForBalance(null)} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" isLoading={actionLoading}>
                Execute Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
