import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Wallet,
  Megaphone,
  Headphones,
  Lock,
  KeyRound,
  Copy,
  Check,
  PlusCircle,
  ArrowUpRight,
  LogOut,
  FileText,
  CreditCard,
  History,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, wallet, logout, refreshSession } = useAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();

  const [copiedCode, setCopiedCode] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const currencySymbol = settings.currencySymbol || 'INR';

  const handleCopyInvitationCode = () => {
    const code = user?.invitationCode || '2035029726';
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const availBal = wallet?.availableBalance ?? 1080.00;
  const frozBal = wallet?.frozenBalance ?? 0.00;
  const userCreditScore = user?.creditScore ?? 100;
  const invCode = user?.invitationCode || '2035029726';

  return (
    <div className="w-full max-w-xl md:max-w-3xl mx-auto space-y-6 pb-24">
      {/* 1. TOP PROFILE BANNER (Matching SS 1 & SS 3 Purple Box) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 p-5 md:p-7 text-white shadow-2xl space-y-3">
        <div className="flex items-center gap-4 md:gap-6">
          {/* User Photo Avatar */}
          <div className="relative shrink-0">
            <img
              src={
                user?.profileImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
              }
              alt={user?.fullName || 'User Profile'}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/80 shadow-lg"
            />
            {user?.isVIP && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-400 text-black text-[10px] md:text-xs font-black flex items-center justify-center border border-white shadow">
                ★
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-1 min-w-0 flex-1">
            <h2 className="text-lg md:text-xl font-black text-white truncate">{user?.fullName || 'Raya'}</h2>
            <div className="text-xs md:text-sm text-purple-200 font-semibold">
              Credit Score: <strong className="text-white font-extrabold">{userCreditScore}</strong>
            </div>

            {/* Invitation Code with Copy button */}
            <div className="flex items-center gap-1.5 text-xs text-purple-200">
              <span>Code: <strong className="text-amber-300 font-mono">{invCode}</strong></span>
              <button
                type="button"
                onClick={handleCopyInvitationCode}
                className="p-1 rounded hover:bg-white/10 text-amber-300 transition-colors"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECHARGE & WITHDRAW SPLIT ACTION BAR (Matching SS 1 & SS 3) */}
      <div className="grid grid-cols-2 gap-3 bg-brand-surface border border-brand-border p-2 md:p-3 rounded-2xl shadow-md">
        <button
          type="button"
          onClick={() => navigate('/wallet/recharge')}
          className="py-3 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 font-extrabold text-xs md:text-sm flex items-center justify-center gap-2 border border-purple-500/30 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-purple-400" /> Recharge
        </button>

        <button
          type="button"
          onClick={() => navigate('/wallet/withdraw')}
          className="py-3 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 font-extrabold text-xs md:text-sm flex items-center justify-center gap-2 border border-purple-500/30 transition-all cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4 text-purple-400" /> Withdraw
        </button>
      </div>

      {/* 3. BALANCES CARD (Matching SS 1 & SS 3 Purple Banner) */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-900 border border-purple-500/40 p-5 md:p-7 text-white shadow-xl">
        <div className="grid grid-cols-2 gap-4 text-center divide-x divide-purple-500/30">
          <div className="space-y-1">
            <span className="text-[11px] md:text-xs font-bold text-purple-200 block uppercase">Available Balance</span>
            <span className="text-xl md:text-2xl font-black font-mono text-white block">
              {availBal.toFixed(2)}
            </span>
            <span className="text-[10px] md:text-xs text-purple-300 font-semibold block">{currencySymbol}</span>
          </div>

          <div className="space-y-1 pl-4">
            <span className="text-[11px] md:text-xs font-bold text-purple-200 block uppercase">Frozen Balance</span>
            <span className="text-xl md:text-2xl font-black font-mono text-white block">
              {frozBal.toFixed(2)}
            </span>
            <span className="text-[10px] md:text-xs text-purple-300 font-semibold block">{currencySymbol}</span>
          </div>
        </div>
      </div>

      {/* 4. GRID OF 7 MENU OPTION ITEMS (Matching SS 1 & SS 3 layout) */}
      <div className="bg-brand-surface border border-brand-border rounded-3xl p-5 md:p-7 shadow-xl space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
          {/* Item 1: Essential Information */}
          <Link to="/profile/essential-information" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
              Essential Information
            </span>
          </Link>

          {/* Item 2: Announcements */}
          <Link to="/announcements" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
              Announcements
            </span>
          </Link>

          {/* Item 3: VIP Records */}
          <Link to="/profile/vip-records" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              VIP Records
            </span>
          </Link>

          {/* Item 4: Finance History */}
          <Link to="/profile/finance-history" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
              Finance History
            </span>
          </Link>

          {/* Item 5: Withdrawal Secrets */}
          <Link to="/profile/withdrawal-secret" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
              Withdrawal Secrets
            </span>
          </Link>

          {/* Item 6: Login Password */}
          <Link to="/profile/login-password" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              Login Password
            </span>
          </Link>

          {/* Item 7: Account */}
          <Link to="/profile/essential-information" className="flex flex-col items-center gap-2 group col-span-2 sm:col-span-2 md:col-span-3 mx-auto">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Headphones className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              Account
            </span>
          </Link>
        </div>
      </div>

      {/* 5. BOTTOM WIDE GRADIENT BUTTON: Cancellation (Matching SS 3 Highlighted Red Box) */}
      <button
        type="button"
        onClick={() => setIsLogoutModalOpen(true)}
        className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-800 hover:from-pink-500 hover:to-indigo-700 text-white font-extrabold text-sm tracking-wider uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/20 flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> Cancellation
      </button>

      {/* CONFIRM LOGOUT MODAL (Matching SS 4 Highlighted Red Box) */}
      {isLogoutModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsLogoutModalOpen(false)}
          title="Confirm Logout"
        >
          <div className="space-y-5 text-center py-2">
            <p className="text-sm font-semibold text-slate-300">
              Are you sure you want to logout?
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-xs shadow-lg transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
