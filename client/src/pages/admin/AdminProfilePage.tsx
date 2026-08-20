import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { User, Mail, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user: adminUser, refreshSession } = useAuth();

  const [form, setForm] = useState({
    fullName: adminUser?.fullName || 'System Administrator',
    email: adminUser?.email || 'admin@winkmedatingclub.com',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await adminService.updateAdminSettings(form);
      if (res.data.success) {
        setMessage('Admin profile credentials updated successfully!');
        setForm((prev) => ({ ...prev, password: '' }));
        refreshSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update admin profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <User className="w-6 h-6 text-amber-400" /> Admin Profile Credentials
          </h1>
          <p className="text-xs text-slate-400">Manage administrator display name, login email, and security password.</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
          <ShieldCheck className="w-4 h-4 text-amber-400" /> SUPER ADMIN ACCESS
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <Card className="p-6 md:p-8 space-y-6 w-full bg-brand-surface border border-brand-border">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <Input
            label="Admin Full Name / Display Title"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            leftIcon={<User className="w-4 h-4 text-amber-400" />}
            required
          />

          <Input
            label="Admin Login Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4 text-amber-400" />}
            required
          />

          <Input
            label="New Admin Password (leave blank to keep current password)"
            type="password"
            placeholder="Enter new password..."
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            leftIcon={<Lock className="w-4 h-4 text-amber-400" />}
          />

          <div className="pt-4 border-t border-brand-border flex justify-end">
            <Button variant="gold" type="submit" isLoading={loading}>
              Save Profile Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
