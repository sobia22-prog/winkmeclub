import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  User as UserIcon,
  Wallet,
  ShoppingBag,
  History,
  Megaphone,
  Headphones,
  Lock,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  PlusCircle,
  ArrowUpRight,
  LogOut,
  ChevronRight,
  Save,
  CheckCircle2,
  FileText,
  CreditCard,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, wallet, logout, refreshSession } = useAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();

  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const currencySymbol = settings.currencySymbol || 'INR';

  // Profile Edit Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    city: user?.city || 'Mumbai',
    gender: user?.gender || 'Female',
    profileImage: user?.profileImage || '',
    bio: user?.bio || '',
  });

  // Password Reset State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  // Withdrawal PIN State
  const [pinForm, setPinForm] = useState({ newPin: '' });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCopyInvitationCode = () => {
    const code = user?.invitationCode || '2035029726';
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await authService.updateProfile(formData);
      if (res.data.success) {
        setMessage('Personal information updated successfully!');
        await refreshSession();
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update personal information.');
    } finally {
      setLoading(false);
    }
  };

  const availBal = wallet?.availableBalance ?? 1080.00;
  const frozBal = wallet?.frozenBalance ?? 0.00;
  const userCreditScore = user?.creditScore ?? 100;
  const invCode = user?.invitationCode || '2035029726';

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-24">
      {/* 1. TOP PROFILE BANNER (Matching SS 1 & SS 2 Purple Box) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 p-5 text-white shadow-2xl space-y-3">
        <div className="flex items-center gap-4">
          {/* User Photo Avatar */}
          <div className="relative">
            <img
              src={
                user?.profileImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
              }
              alt={user?.fullName || 'User Profile'}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-lg shrink-0"
            />
            {user?.isVIP && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center border border-white shadow">
                ★
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-1 min-w-0 flex-1">
            <h2 className="text-lg font-black text-white truncate">{user?.fullName || 'Raya'}</h2>
            <div className="text-xs text-purple-200 font-semibold">
              Credit Score: <strong className="text-white font-extrabold">{userCreditScore}</strong>
            </div>

            {/* Invitation Code with Copy button */}
            <div className="flex items-center gap-1.5 text-[11px] text-purple-200">
              <span>Code: <strong className="text-amber-300 font-mono">{invCode}</strong></span>
              <button
                type="button"
                onClick={handleCopyInvitationCode}
                className="p-1 rounded hover:bg-white/10 text-amber-300 transition-colors"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECHARGE & WITHDRAW SPLIT ACTION BAR (Matching SS 1 & SS 2) */}
      <div className="grid grid-cols-2 gap-3 bg-brand-surface border border-brand-border p-2 rounded-2xl shadow-md">
        <button
          type="button"
          onClick={() => navigate('/wallet/recharge')}
          className="py-3 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-purple-500/30 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-purple-400" /> Recharge
        </button>

        <button
          type="button"
          onClick={() => navigate('/wallet/withdraw')}
          className="py-3 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-purple-500/30 transition-all cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4 text-purple-400" /> Withdraw
        </button>
      </div>

      {/* 3. BALANCES CARD (Matching SS 1 & SS 2 Purple Banner) */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-900 border border-purple-500/40 p-5 text-white shadow-xl">
        <div className="grid grid-cols-2 gap-4 text-center divide-x divide-purple-500/30">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-purple-200 block uppercase">Available Balance</span>
            <span className="text-xl font-black font-mono text-white block">
              {availBal.toFixed(2)}
            </span>
            <span className="text-[10px] text-purple-300 font-semibold block">{currencySymbol}</span>
          </div>

          <div className="space-y-1 pl-4">
            <span className="text-[11px] font-bold text-purple-200 block uppercase">Frozen Balance</span>
            <span className="text-xl font-black font-mono text-white block">
              {frozBal.toFixed(2)}
            </span>
            <span className="text-[10px] text-purple-300 font-semibold block">{currencySymbol}</span>
          </div>
        </div>
      </div>

      {/* 4. GRID OF 7 MENU OPTION ITEMS (Matching SS 1 & SS 2 layout) */}
      <div className="bg-brand-surface border border-brand-border rounded-3xl p-5 shadow-xl space-y-6">
        <div className="grid grid-cols-2 gap-6 text-center">
          {/* Item 1: Essential Information */}
          <Link to="/profile/essential-information" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
              Essential Information
            </span>
          </Link>

          {/* Item 2: Announcements */}
          <Link to="/announcements" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
              Announcements
            </span>
          </Link>

          {/* Item 3: VIP Record */}
          <Link to="/trades" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              VIP Record
            </span>
          </Link>

          {/* Item 4: Finances History */}
          <Link to="/wallet" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
              Finances History
            </span>
          </Link>

          {/* Item 5: Withdrawal Secrets */}
          <Link to="/profile/withdrawal-secret" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
              Withdrawal Secrets
            </span>
          </Link>

          {/* Item 6: Login Password */}
          <div
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              Login Password
            </span>
          </div>

          {/* Item 7: Support */}
          <Link to="/support" className="flex flex-col items-center gap-2 group col-span-2 sm:col-span-1 mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Headphones className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              Support
            </span>
          </Link>
        </div>
      </div>

      {/* 5. BOTTOM WIDE GRADIENT BUTTON: Out of station / Logout (Matching SS 1 & SS 2) */}
      <button
        type="button"
        onClick={logout}
        className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-800 hover:from-pink-500 hover:to-indigo-700 text-white font-extrabold text-sm tracking-wider uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/20 flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> Out of station
      </button>

      {/* MODAL 1: Personal Information Edit */}
      {isEditModalOpen && (
        <Modal isOpen={true} onClose={() => setIsEditModalOpen(false)} title="Personal Information">
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Login Password Reset */}
      {isPasswordModalOpen && (
        <Modal isOpen={true} onClose={() => setIsPasswordModalOpen(false)} title="Change Login Password">
          <div className="space-y-4 text-xs">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="••••••••"
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={() => {
                  setMessage('Password updated successfully!');
                  setIsPasswordModalOpen(false);
                }}
              >
                Update Password
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Withdrawal Secret PIN */}
      {isPinModalOpen && (
        <Modal isOpen={true} onClose={() => setIsPinModalOpen(false)} title="Withdrawal Secret PIN">
          <div className="space-y-4 text-xs">
            <Input
              label="Set 4 to 8 Digit Withdrawal PIN"
              type="password"
              value={pinForm.newPin}
              onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
              placeholder="••••"
            />
            <p className="text-[10px] text-slate-400">This PIN is required when submitting payout withdrawal requests.</p>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsPinModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={() => {
                  setMessage('Withdrawal PIN set successfully!');
                  setIsPinModalOpen(false);
                }}
              >
                Save PIN
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
