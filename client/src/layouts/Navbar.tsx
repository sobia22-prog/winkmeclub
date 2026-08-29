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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-2.5 sm:px-4 md:px-8 flex items-center justify-between shadow-sm">
      {/* Brand Logo & App Name */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link to={user?.role === 'STAFF' ? '/staff/dashboard' : isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2 group">
          {settings.projectImage ? (
            <img
              src={settings.projectImage}
              alt={currentAppName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-pink-200 shadow-sm group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-wider">
                {currentAppName.charAt(0)}
              </span>
            </div>
          )}

          <div className="hidden xs:block sm:block">
            <h1 className="font-extrabold text-xs sm:text-base tracking-tight text-slate-900 group-hover:text-pink-600 transition-colors truncate max-w-[120px] sm:max-w-none">
              {currentAppName}
            </h1>
            <p className="text-[9px] sm:text-[10px] text-pink-600 font-bold -mt-0.5 uppercase tracking-widest">VIP Club</p>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
        {/* User Balance Display Pill */}
        {user && user.role === 'USER' && (
          <Link
            to="/wallet"
            className="px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-pink-50 border border-pink-200 hover:border-pink-400 transition-colors flex items-center gap-1 sm:gap-2 shrink-0"
          >
            <WalletIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600" />
            <span className="text-[11px] sm:text-xs font-black text-pink-600 font-mono">
              {currencySymbol}{(wallet?.availableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </Link>
        )}

        {/* Notification Bell Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl border border-slate-200 transition-colors relative"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-pink-600 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute -right-12 sm:right-0 mt-2 w-[calc(100vw-2.5rem)] sm:w-96 max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 sm:p-4 border-b border-slate-100 bg-pink-50/50 flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] sm:text-xs text-pink-600 hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
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
                        className={`p-3 sm:p-3.5 hover:bg-pink-50/50 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-pink-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
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
          <div className="flex items-center gap-1.5 sm:gap-3 pl-1.5 sm:pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2">
              <img
                src={
                  user.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={user.fullName}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-slate-200"
              />
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{user.fullName}</span>
                  {user.isVIP && <Badge variant="vip" size="sm" />}
                </div>
                <span className="text-[10px] text-slate-500 block -mt-0.5">{user.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-colors shadow-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
