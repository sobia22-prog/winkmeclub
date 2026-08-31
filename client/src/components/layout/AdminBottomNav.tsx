import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  Users,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  UserCheck,
  ShieldCheck,
  Package,
  Settings,
  Megaphone,
  Headphones,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

export const AdminBottomNav: React.FC = () => {
  const { user } = useAuth();
  const { t } = useSystemSettings();
  const navigate = useNavigate();
  const isStaff = user?.role === 'STAFF';
  const [showMoreModal, setShowMoreModal] = useState(false);

  const staffNavItems = [
    { label: 'Dashboard', path: '/staff/dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
    { label: 'Users', path: '/staff/users', icon: <Users className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
    { label: 'Trades', path: '/staff/trades', icon: <TrendingUp className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
    { label: 'Withdraw', path: '/staff/withdrawals', icon: <ArrowUpRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
    { label: 'Verify', path: '/staff/verifications', icon: <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
  ];

  const adminMainItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
    { label: 'Girls', path: '/admin/girls', icon: <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
    { label: 'Trades', path: '/admin/trades', icon: <TrendingUp className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> },
  ];

  const adminMoreItems = [
    { label: 'Recharge Requests', path: '/admin/recharges', icon: <ArrowDownRight className="w-5 h-5 text-pink-600" /> },
    { label: 'Withdraw Requests', path: '/admin/withdrawals', icon: <ArrowUpRight className="w-5 h-5 text-pink-600" /> },
    { label: t('staffMembers'), path: '/admin/staff', icon: <UserCheck className="w-5 h-5 text-pink-600" /> },
    { label: t('verification'), path: '/admin/verifications', icon: <ShieldCheck className="w-5 h-5 text-pink-600" /> },
    { label: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5 text-pink-600" /> },
    { label: t('paymentSettings'), path: '/admin/settings', icon: <Settings className="w-5 h-5 text-pink-600" /> },
    { label: t('announcements'), path: '/admin/announcements', icon: <Megaphone className="w-5 h-5 text-pink-600" /> },
    { label: t('customerService'), path: '/admin/support', icon: <Headphones className="w-5 h-5 text-pink-600" /> },
    { label: t('profile'), path: '/admin/profile', icon: <User className="w-5 h-5 text-pink-600" /> },
  ];

  const activeItems = isStaff ? staffNavItems : adminMainItems;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[56px] bg-white/95 backdrop-blur-lg border-t border-slate-200 md:hidden px-1 py-1 grid grid-cols-5 items-center justify-items-center shadow-lg">
        {activeItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex flex-col items-center justify-center gap-0.5 text-[9.5px] sm:text-[11px] font-semibold transition-all px-0.5 py-1 rounded-xl ${
                isActive
                  ? 'bg-pink-100/80 text-pink-600 font-extrabold shadow-sm border border-pink-200 scale-105'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            {item.icon}
            <span className="truncate w-full text-center">{item.label}</span>
          </NavLink>
        ))}

        {!isStaff && (
          <button
            type="button"
            onClick={() => setShowMoreModal(true)}
            className="w-full flex flex-col items-center justify-center gap-0.5 text-[9.5px] sm:text-[11px] font-semibold transition-all px-0.5 py-1 rounded-xl text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <MoreHorizontal className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            <span className="truncate w-full text-center">More</span>
          </button>
        )}
      </nav>

      {/* ADMIN MORE TOOLS SLIDE-UP MODAL */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 md:hidden">
          <div className="w-full bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">More Admin Tools</h3>
              <button
                type="button"
                onClick={() => setShowMoreModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {adminMoreItems.map((item) => (
                <div
                  key={item.path}
                  onClick={() => {
                    setShowMoreModal(false);
                    navigate(item.path);
                  }}
                  className="p-3 bg-slate-50 border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-sm"
                >
                  <div className="p-2 rounded-xl bg-white border border-pink-100 shadow-sm shrink-0">
                    {item.icon}
                  </div>
                  <span className="font-bold text-slate-900 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
