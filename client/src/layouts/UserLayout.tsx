import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { Skeleton } from '../components/common/Skeleton';
import { VipAnnouncementModal } from '../components/common/VipAnnouncementModal';

export const UserLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="space-y-4 w-full max-w-md text-center">
          <div className="w-12 h-12 rounded-2xl bg-pink-600 mx-auto animate-pulse" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'STAFF') {
    return <Navigate to="/staff/dashboard" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar />
      <div className="flex flex-1 items-start">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <VipAnnouncementModal />
    </div>
  );
};
