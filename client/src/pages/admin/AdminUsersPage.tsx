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
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { brandConfig } from '../../config/brand.config';
import {
  Users,
  Search,
  DollarSign,
  Eye,
  UserCheck,
  UserX,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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

  // Create / Edit Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfileUser, setEditProfileUser] = useState<User | null>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Mumbai',
    gender: 'Female',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    bio: '',
    status: 'ACTIVE',
    isVIP: true,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Custom Styled Confirmation Popup Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'gold' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({
        search,
        status: status === 'ALL' ? undefined : status,
        isVIP: isVIP === 'ALL' ? undefined : isVIP === 'VIP',
      });
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, status, isVIP]);

  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await adminService.adjustUserBalance(selectedUserForBalance.id || selectedUserForBalance._id!, balanceForm);
      if (res.data.success) {
        setMessage(`Balance updated successfully for ${selectedUserForBalance.fullName}!`);
        setSelectedUserForBalance(null);
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust user balance.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAddProfile = () => {
    setEditProfileUser(null);
    setProfileForm({
      fullName: '',
      email: '',
      phone: '',
      city: 'Mumbai',
      gender: 'Female',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      bio: '',
      status: 'ACTIVE',
      isVIP: true,
    });
    setShowProfileModal(true);
  };

  const handleOpenEditProfile = (user: User) => {
    setEditProfileUser(user);
    setProfileForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || 'Mumbai',
      gender: user.gender || 'Female',
      profileImage: user.profileImage || '',
      bio: user.bio || '',
      status: user.status || 'ACTIVE',
      isVIP: user.isVIP ?? true,
    });
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      if (editProfileUser) {
        const res = await adminService.updateUserProfile(editProfileUser.id || editProfileUser._id!, profileForm);
        if (res.data.success) {
          setMessage(`Profile ${profileForm.fullName} updated successfully!`);
          setShowProfileModal(false);
          fetchUsers();
        }
      } else {
        const res = await adminService.createMatchProfile(profileForm);
        if (res.data.success) {
          setMessage(`Match Profile ${profileForm.fullName} created successfully!`);
          setShowProfileModal(false);
          fetchUsers();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfile = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User Profile',
      message: `Are you sure you want to permanently delete the profile for "${user.fullName}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.deleteUserProfile(user.id || user._id!);
          setMessage(`Profile for ${user.fullName} deleted successfully.`);
          fetchUsers();
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to delete profile.');
        }
      },
    });
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setConfirmModal({
      isOpen: true,
      title: `${newStatus === 'ACTIVE' ? 'Activate' : 'Suspend'} Account Status`,
      message: `Are you sure you want to change "${user.fullName}"'s status to ${newStatus}?`,
      variant: newStatus === 'SUSPENDED' ? 'danger' : 'gold',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.toggleUserStatus(user.id || user._id!, { status: newStatus });
          setMessage(`Status for ${user.fullName} changed to ${newStatus}.`);
          fetchUsers();
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to update account status.');
        }
      },
    });
  };

  const handleToggleVIP = async (user: User) => {
    const newVIP = !user.isVIP;
    try {
      await adminService.toggleUserStatus(user.id || user._id!, { isVIP: newVIP });
      setMessage(`VIP status updated for ${user.fullName}.`);
      fetchUsers();
    } catch (err: any) {
      setError('Failed to update VIP status.');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" /> User Directory & Accounts
          </h1>
          <p className="text-xs text-slate-400">Manage registered members, VIP statuses, balances, & profile cards.</p>
        </div>

        <Button variant="gold" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={handleOpenAddProfile}>
          Add New Profile Card
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" /> {error}
          </div>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Select
          options={[
            { label: 'All Statuses', value: 'ALL' },
            { label: 'Active Only', value: 'ACTIVE' },
            { label: 'Suspended Only', value: 'SUSPENDED' },
          ]}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Select
          options={[
            { label: 'All Users (VIP & Normal)', value: 'ALL' },
            { label: 'VIP Members Only', value: 'VIP' },
            { label: 'Non-VIP Users', value: 'NORMAL' },
          ]}
          value={isVIP}
          onChange={(e) => setIsVIP(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <p className="text-center text-xs text-slate-500 py-10">Loading user catalog...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10">No users found matching query.</p>
        ) : (
          <Table headers={['Profile Photo & Name', 'Assigned Staff', 'City', 'Status', 'VIP', 'Available', 'Frozen', 'Actions']}>
            {users.map((u: any) => (
              <tr key={u._id || u.id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                      alt={u.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-brand-border shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-100">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs">
                  {u.assignedStaff ? (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[11px]">
                      {u.assignedStaff.invitationCode || u.assignedStaff.fullName}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic">Unassigned</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-slate-300 font-semibold">{u.city || 'Mumbai'}</td>
                <td className="px-5 py-3">
                  {u.status === 'ACTIVE' ? <Badge variant="verified">ACTIVE</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => handleToggleVIP(u)} className="cursor-pointer" title="Click to toggle VIP status">
                    {u.isVIP ? <Badge variant="vip">VIP CLUB</Badge> : <Badge variant="neutral">TOGGLE VIP</Badge>}
                  </button>
                </td>
                <td className="px-5 py-3 font-bold text-emerald-400 text-xs">
                  ₹{(u.wallet?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 font-bold text-amber-400 text-xs">
                  ₹{(u.wallet?.frozenBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditProfile(u)}
                      className="p-1.5 rounded-lg bg-brand-card border border-brand-border text-slate-300 hover:text-white hover:border-amber-500/40 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      to={`/admin/users/${u._id || u.id}`}
                      className="p-1.5 rounded-lg bg-brand-card border border-brand-border text-slate-300 hover:text-white hover:border-amber-500/40 transition-colors"
                      title="View Full User Details & History"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => setSelectedUserForBalance(u)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Adjust Vault Balance"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                    >
                      {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDeleteProfile(u)}
                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete Profile Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Styled Custom Confirmation Popup Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText="Confirm Action"
      />

      {/* Create / Edit Profile Card Modal */}
      {showProfileModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowProfileModal(false)}
          title={editProfileUser ? 'Edit Member Profile Card' : 'Add New Member Profile Card'}
        >
          <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <ImageUploadPicker
              label="Profile Photo (Upload or Paste URL)"
              value={profileForm.profileImage}
              onChange={(url) => setProfileForm({ ...profileForm, profileImage: url })}
            />

            <Input
              label="Full Name"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              required
            />

            <Input
              label="Phone Number"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="City"
                options={[
                  { label: 'Mumbai', value: 'Mumbai' },
                  { label: 'Delhi', value: 'Delhi' },
                  { label: 'Bangalore', value: 'Bangalore' },
                  { label: 'Hyderabad', value: 'Hyderabad' },
                  { label: 'Pune', value: 'Pune' },
                  { label: 'Agra', value: 'Agra' },
                ]}
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              />

              <Select
                label="Gender"
                options={[
                  { label: 'Female', value: 'Female' },
                  { label: 'Male', value: 'Male' },
                ]}
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              />
            </div>

            <Textarea
              label="Short Bio / Description"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Account Status"
                options={[
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Suspended', value: 'SUSPENDED' },
                ]}
                value={profileForm.status}
                onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
              />

              <Select
                label="VIP Status"
                options={[
                  { label: 'VIP Club Member', value: 'true' },
                  { label: 'Normal Member', value: 'false' },
                ]}
                value={String(profileForm.isVIP)}
                onChange={(e) => setProfileForm({ ...profileForm, isVIP: e.target.value === 'true' })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowProfileModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" isLoading={actionLoading}>
                {editProfileUser ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Adjust User Vault Balance Modal */}
      {selectedUserForBalance && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUserForBalance(null)}
          title={`Adjust Vault Balance for ${selectedUserForBalance.fullName}`}
        >
          <form onSubmit={handleBalanceSubmit} className="space-y-4">
            <div className="p-3 bg-brand-card border border-brand-border rounded-xl text-xs space-y-1">
              <div>Available Balance: <strong className="text-emerald-400">₹{(selectedUserForBalance.wallet?.availableBalance ?? 0).toFixed(2)}</strong></div>
              <div>Frozen Balance: <strong className="text-amber-400">₹{(selectedUserForBalance.wallet?.frozenBalance ?? 0).toFixed(2)}</strong></div>
            </div>

            <Select
              label="Adjustment Action"
              options={[
                { label: '➕ Add Funds (Increase Available)', value: 'ADD' },
                { label: '🔒 Freeze Funds (Move Available -> Frozen)', value: 'FREEZE' },
                { label: '🔓 Unfreeze Funds (Move Frozen -> Available)', value: 'UNFREEZE' },
                { label: '➖ Deduct Funds (Decrease Available)', value: 'DEDUCT' },
              ]}
              value={balanceForm.action}
              onChange={(e) => setBalanceForm({ ...balanceForm, action: e.target.value as any })}
            />

            <Input
              label="Adjustment Amount (₹)"
              type="number"
              value={balanceForm.amount}
              onChange={(e) => setBalanceForm({ ...balanceForm, amount: Number(e.target.value) })}
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
