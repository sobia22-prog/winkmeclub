import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, ShieldCheck, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Matches', path: '/matches', icon: <Users className="w-5 h-5" /> },
    { label: 'Verification', path: '/verification', icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[56px] bg-white/95 backdrop-blur-lg border-t border-slate-200 md:hidden px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold transition-all px-2.5 py-1 rounded-xl ${
              isActive ? 'bg-pink-100/80 text-pink-600 font-extrabold shadow-sm border border-pink-200 scale-105' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
