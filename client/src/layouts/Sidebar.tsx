import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, ShieldCheck, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../contexts/SystemSettingsContext';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useSystemSettings();

  const mainNavItems = [
    { label: t('home'), path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: t('matches'), path: '/matches', icon: <Users className="w-5 h-5" /> },
    { label: t('verification'), path: '/verification', icon: <ShieldCheck className="w-5 h-5" /> },
    { label: t('profile'), path: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 hidden md:flex self-start">
      <div className="space-y-1.5">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50/60'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};
