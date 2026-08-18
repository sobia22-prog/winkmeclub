import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOTPPage } from './pages/auth/VerifyOTPPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

// User Pages
import { DashboardPage } from './pages/user/DashboardPage';
import { MatchesPage } from './pages/user/MatchesPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { VerificationPage } from './pages/user/VerificationPage';
import { WalletPage } from './pages/user/WalletPage';
import { TradesPage } from './pages/user/TradesPage';
import { TransactionsPage } from './pages/user/TransactionsPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { SupportPage } from './pages/user/SupportPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { AdminTradesPage } from './pages/admin/AdminTradesPage';
import { AdminRechargesPage } from './pages/admin/AdminRechargesPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Error Pages
import { NotFoundPage } from './pages/errors/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected User Routes */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/trades" element={<TradesPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/support" element={<SupportPage />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
              <Route path="/admin/trades" element={<AdminTradesPage />} />
              <Route path="/admin/recharges" element={<AdminRechargesPage />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
              <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
              <Route path="/admin/support" element={<AdminSupportPage />} />
            </Route>

            {/* Fallback 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
