import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../contexts/SystemSettingsContext';
import { brandConfig } from '../config/brand.config';
import { Badge } from '../components/common/Badge';
import { Bell, Wallet as WalletIcon, LogOut } from 'lucide-react';
import { notificationService } from '../services/notification.service';
import { Notification } from '../types';

export const Navbar: React.FC = () => {
  const { user, wallet, logout, isAdmin } = useAuth();
  const { settings } = useSystemSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      notificationService
        .getNotifications()
        .then((res) => {
          if (res.data.success) {
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const currentAppName = settings.appName || brandConfig.name;
  const currencySymbol = settings.currencySymbol || '₹';

  return (
    <header className="h-16 bg-brand-surface/90 backdrop-blur-md border-b border-brand-border sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      {/* Brand Logo & App Name */}
      <div className="flex items-center gap-3">
        <Link to={user?.role === 'STAFF' ? '/staff/dashboard' : isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2 group">
          {settings.projectImage ? (
            <img
              src={settings.projectImage}
              alt={currentAppName}
              className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shadow-lg group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-wine to-purple-600 flex items-center justify-center shadow-lg shadow-brand-wine/30 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg text-white tracking-wider">
                {currentAppName.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors">
              {currentAppName}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5 uppercase tracking-widest">VIP Club</p>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">


        {/* Notification Bell Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 text-slate-300 hover:text-white hover:bg-brand-card rounded-xl border border-brand-border transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-wine text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-brand-border bg-brand-card flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-brand-wine hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-brand-border/60">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-500">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          setShowNotifDropdown(false);
                          if (n.link) navigate(n.link);
                        }}
                        className={`p-3.5 hover:bg-brand-card cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-brand-wine/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-200">{n.title}</h5>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Avatar & Info */}
        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-brand-border">
            <div className="flex items-center gap-2">
              <img
                src={
                  user.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={user.fullName}
                className="w-9 h-9 rounded-xl object-cover border border-brand-border"
              />
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200">{user.fullName}</span>
                  {user.isVIP && <Badge variant="vip" size="sm" />}
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5">{user.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-brand-wine text-white text-xs font-semibold rounded-xl hover:bg-brand-wineHover transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
