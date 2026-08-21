import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import { AdminSidebar } from './AdminSidebar';
import { Skeleton } from '../components/common/Skeleton';

export const AdminLayout: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6">
        <Skeleton className="h-8 w-48 mx-auto" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Restrict Staff from accessing platform settings, dashboard, and staff management pages
  const forbiddenStaffPaths = [
    '/admin',
    '/admin/dashboard',
    '/admin/products',
    '/admin/announcements',
    '/admin/settings',
    '/admin/staff',
  ];

  if (user.role === 'STAFF' && forbiddenStaffPaths.includes(location.pathname)) {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-start">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
