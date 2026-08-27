import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Package,
  History,
  Megaphone,
  Headphones,
  User,
  Settings,
  LogOut,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../contexts/SystemSettingsContext';

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useSystemSettings();
  const isStaff = user?.role === 'STAFF';

  const adminNavItems = isStaff
    ? [
        { label: t('dashboard'), path: '/staff/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: t('girlsProfiles'), path: '/staff/girls', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
        { label: t('users'), path: '/staff/users', icon: <Users className="w-4 h-4" /> },
        { label: t('tradeRequests'), path: '/staff/trades', icon: <TrendingUp className="w-4 h-4" /> },
        { label: t('verification'), path: '/staff/verifications', icon: <ShieldCheck className="w-4 h-4" /> },
      ]
    : [
        { label: t('dashboard'), path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: t('girlsProfiles'), path: '/admin/girls', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
        { label: t('staffMembers'), path: '/admin/staff', icon: <UserCheck className="w-4 h-4" /> },
        { label: t('users'), path: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: t('tradeRequests'), path: '/admin/trades', icon: <TrendingUp className="w-4 h-4" /> },
        { label: t('verification'), path: '/admin/verifications', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Products', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
        { label: t('paymentSettings'), path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
        { label: t('announcements'), path: '/admin/announcements', icon: <Megaphone className="w-4 h-4" /> },
        { label: t('customerService'), path: '/admin/support', icon: <Headphones className="w-4 h-4" /> },
        { label: t('profile'), path: '/admin/profile', icon: <User className="w-4 h-4" /> },
      ];

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto w-64 bg-brand-surface border-r border-brand-border p-3.5 flex flex-col justify-between shrink-0 hidden md:flex self-start space-y-4">
      <div className="space-y-1">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-brand-card'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="pt-4 border-t border-brand-border mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Panel</span>
        </button>
      </div>
    </aside>
  );
};
