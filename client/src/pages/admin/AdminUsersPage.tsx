import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { useAuth } from '../../contexts/AuthContext';
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
import {
  Users,
  Search,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Wallet,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const { user: currentUser } = useAuth();
  const isStaff = currentUser?.role === 'STAFF';
  const userDetailBasePath = isStaff ? '/staff/users' : '/admin/users';
  const currencySymbol = settings.currencySymbol || '₹';

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isVIP, setIsVIP] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Edit User Modal State
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
    creditScore: 100,
    allowWithdraw: true,
    allowTrade: true,
    totalBalance: 0,
    frozenBalance: 0,
    loadAmount: '',
    password: '',
    transactionPin: '',
    hasTransactionPin: false,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Styled Confirmation Modal State
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
        status: statusFilter === 'ALL' ? undefined : statusFilter,
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
  }, [search, statusFilter, isVIP]);

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
      creditScore: 100,
      allowWithdraw: true,
      allowTrade: true,
      totalBalance: 0,
      frozenBalance: 0,
      loadAmount: '',
      password: '',
      transactionPin: '',
      hasTransactionPin: false,
    });
    setShowProfileModal(true);
  };

  const handleOpenEditProfile = (user: User | any) => {
    setEditProfileUser(user);
    const tot = user.wallet?.totalBalance ?? ((user.wallet?.availableBalance ?? 0) + (user.wallet?.frozenBalance ?? 0));
    const froz = user.wallet?.frozenBalance ?? 0;

    let userStatus = user.status || 'ACTIVE';
    if (userStatus === 'SUSPENDED') userStatus = 'BLOCKED';

    setProfileForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || 'Mumbai',
      gender: user.gender || 'Female',
      profileImage: user.profileImage || '',
      bio: user.bio || '',
      status: userStatus,
      isVIP: user.isVIP ?? true,
      creditScore: user.creditScore ?? 100,
      allowWithdraw: user.allowWithdraw ?? true,
      allowTrade: user.allowTrade ?? true,
      totalBalance: tot,
      frozenBalance: froz,
      loadAmount: '',
      password: '',
      transactionPin: '',
      hasTransactionPin: Boolean(user.hasTransactionPin || user.transactionPinHash),
    });
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      const payload: any = {
        fullName: profileForm.fullName,
        email: profileForm.email,
        phone: profileForm.phone,
        city: profileForm.city,
        gender: profileForm.gender,
        profileImage: profileForm.profileImage,
        bio: profileForm.bio,
        status: profileForm.status === 'BLOCKED' ? 'SUSPENDED' : profileForm.status,
        isVIP: profileForm.isVIP,
        creditScore: Number(profileForm.creditScore),
        allowWithdraw: profileForm.allowWithdraw,
        allowTrade: profileForm.allowTrade,
        totalBalance: Number(profileForm.totalBalance),
        frozenBalance: Number(profileForm.frozenBalance),
      };

      if (profileForm.loadAmount && Number(profileForm.loadAmount) > 0) {
        payload.loadAmount = Number(profileForm.loadAmount);
      }

      if (profileForm.password.trim()) {
        payload.password = profileForm.password.trim();
      }

      if (profileForm.transactionPin.trim()) {
        payload.transactionPin = profileForm.transactionPin.trim();
      }

      if (editProfileUser) {
        const userId = editProfileUser.id || editProfileUser._id!;
        const res = await adminService.updateUserProfile(userId, payload);
        if (res.data.success) {
          setMessage(`User profile for "${profileForm.fullName}" updated successfully!`);
          setShowProfileModal(false);
          fetchUsers();
        }
      } else {
        const res = await adminService.createMatchProfile(payload);
        if (res.data.success) {
          setMessage(`User profile for "${profileForm.fullName}" created successfully!`);
          setShowProfileModal(false);
          fetchUsers();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile save operation failed.');
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
          setMessage(`Profile for "${user.fullName}" deleted successfully.`);
          fetchUsers();
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to delete profile.');
        }
      },
    });
  };

  // Live calculation of balances in modal
  const loadedVal = Number(profileForm.loadAmount) || 0;
  const currentTotal = Number(profileForm.totalBalance) || 0;
  const currentFrozen = Number(profileForm.frozenBalance) || 0;
  const newTotalBalance = currentTotal + loadedVal;
  const availableBalanceAuto = Math.max(0, newTotalBalance - currentFrozen);

  return (
    <div className="space-y-6 w-full">
      {/* Primary Header with Title and Create User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-600" /> User Directory & Accounts
          </h1>
          <p className="text-xs text-slate-500">Manage registered client members, status, balances, and permissions.</p>
        </div>

        <Button
          variant="primary"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={handleOpenAddProfile}
          className="shrink-0 self-start sm:self-auto"
        >
          Create User Profile
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="w-full overflow-x-auto">
        <div className="inline-flex items-center gap-1 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm min-w-full sm:min-w-0">
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Blocked', value: 'BLOCKED' },
            { label: 'Pending', value: 'PENDING' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none text-center ${
                statusFilter === tab.value
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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

      {/* Search & VIP Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
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
          <p className="text-center text-xs text-slate-500 py-10">Loading user directory...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10">No users found matching search query.</p>
        ) : (
          <Table headers={['Profile Photo & Name', 'Assigned Staff', 'Credit Score', 'Status', 'VIP', `Available (${currencySymbol})`, `Frozen (${currencySymbol})`, 'Actions']}>
            {users.map((u: any) => {
              const userStatus = u.status === 'SUSPENDED' ? 'BLOCKED' : (u.status || 'ACTIVE');
              return (
                <tr key={u._id || u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                        alt={u.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {u.assignedStaff ? (
                      <span className="px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 font-mono font-bold text-[11px]">
                        {typeof u.assignedStaff === 'object'
                          ? (u.assignedStaff.invitationCode || u.assignedStaff.fullName || 'Staff')
                          : u.assignedStaff}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs font-bold text-pink-600">{u.creditScore ?? 100} / 100</td>
                  <td className="px-5 py-3">
                    {userStatus === 'ACTIVE' && <Badge variant="verified">ACTIVE</Badge>}
                    {userStatus === 'BLOCKED' && <Badge variant="danger">BLOCKED</Badge>}
                    {userStatus === 'PENDING' && <Badge variant="warning">PENDING</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    {u.isVIP ? <Badge variant="vip">VIP</Badge> : <Badge variant="neutral">NONE</Badge>}
                  </td>
                  <td className="px-5 py-3 font-bold text-emerald-600 text-xs">
                    {currencySymbol}{(u.wallet?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 font-bold text-pink-600 text-xs">
                    {currencySymbol}{(u.wallet?.frozenBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {/* 3 ACTION BUTTONS */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProfile(u)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-pink-300 transition-colors shadow-sm"
                        title="Edit User Settings & Balances"
                      >
                        <Edit className="w-4 h-4 text-pink-600" />
                      </button>

                      <Link
                        to={`${userDetailBasePath}/${u._id || u.id}`}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-pink-300 transition-colors shadow-sm"
                        title="View Full Profile & Detailed History"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </Link>

                      <button
                        onClick={() => handleDeleteProfile(u)}
                        className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors shadow-sm"
                        title="Delete User Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

      {/* EDIT USER MODAL */}
      {showProfileModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowProfileModal(false)}
          title={editProfileUser ? 'Edit User' : 'Add New User'}
          maxWidth="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 text-xs">
            {/* SECTION 1: Personal & Account Credentials */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-pink-700">Account Credentials & Profile</h3>
              
              <Input
                label="Username / Full Name"
                placeholder="Enter username / full name"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
              />

              <Select
                label="Gender"
                options={[
                  { label: 'Female', value: 'Female' },
                  { label: 'Male', value: 'Male' },
                  { label: 'Non-Binary', value: 'Non-Binary' },
                  { label: 'Other', value: 'Other' },
                ]}
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              />

              {!editProfileUser ? (
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  required
                />
              ) : (
                <div className="space-y-1">
                  <Input
                    label="Reset Password (optional)"
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-500">Leave blank to keep unchanged</p>
                </div>
              )}
            </div>

            {/* SECTION 2: Account Status & Permissions */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-700">Account Status & Permissions</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Status"
                  options={[
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'Blocked', value: 'BLOCKED' },
                    { label: 'Pending', value: 'PENDING' },
                  ]}
                  value={profileForm.status}
                  onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                />

                <Select
                  label="VIP Member Status"
                  options={[
                    { label: 'VIP Member', value: 'true' },
                    { label: 'Regular User', value: 'false' },
                  ]}
                  value={String(profileForm.isVIP)}
                  onChange={(e) => setProfileForm({ ...profileForm, isVIP: e.target.value === 'true' })}
                />
              </div>

              <Input
                label="Credit Score"
                type="number"
                value={profileForm.creditScore.toString()}
                onChange={(e) => setProfileForm({ ...profileForm, creditScore: Number(e.target.value) })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Select
                    label="Allow Withdraw"
                    options={[
                      { label: 'Yes', value: 'true' },
                      { label: 'No', value: 'false' },
                    ]}
                    value={String(profileForm.allowWithdraw)}
                    onChange={(e) => setProfileForm({ ...profileForm, allowWithdraw: e.target.value === 'true' })}
                  />
                  <p className="text-[10px] text-slate-500">When set to No, client cannot submit withdrawals.</p>
                </div>

                <div className="space-y-1">
                  <Select
                    label="Allow Trade"
                    options={[
                      { label: 'Yes', value: 'true' },
                      { label: 'No', value: 'false' },
                    ]}
                    value={String(profileForm.allowTrade)}
                    onChange={(e) => setProfileForm({ ...profileForm, allowTrade: e.target.value === 'true' })}
                  />
                  <p className="text-[10px] text-slate-500">When set to No, client cannot submit VIP trades.</p>
                </div>
              </div>
            </div>

            {/* SECTION 3: Financial & Wallet Balance Controls */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700">Financial & Wallet Balances</h3>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                <Input
                  label={`Load Amount (${currencySymbol})`}
                  type="number"
                  placeholder="Enter amount to add..."
                  value={profileForm.loadAmount}
                  onChange={(e) => setProfileForm({ ...profileForm, loadAmount: e.target.value })}
                />
                <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-100">
                  <span className="text-slate-700">New Total Balance:</span>
                  <span className="text-emerald-600 font-mono">{currencySymbol}{newTotalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Total Balance"
                  type="number"
                  value={profileForm.totalBalance.toString()}
                  onChange={(e) => setProfileForm({ ...profileForm, totalBalance: Number(e.target.value) })}
                />

                <Input
                  label="Frozen Balance"
                  type="number"
                  value={profileForm.frozenBalance.toString()}
                  onChange={(e) => setProfileForm({ ...profileForm, frozenBalance: Number(e.target.value) })}
                />
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Available Balance (auto)</span>
                <span className="text-xs font-bold text-pink-600 font-mono">
                  {currencySymbol}{availableBalanceAuto.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <Input
                  label="Transaction PIN (optional)"
                  type="password"
                  placeholder="4 to 8 digits (optional)"
                  value={profileForm.transactionPin}
                  onChange={(e) => setProfileForm({ ...profileForm, transactionPin: e.target.value })}
                />
                <p className="text-[10px] text-slate-500">4 to 8 digits (optional for create and edit)</p>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setShowProfileModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={actionLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
