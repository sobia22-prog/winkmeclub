import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { brandConfig } from '../../config/brand.config';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { UserCheck, Mail, Lock } from 'lucide-react';

export const StaffLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loginSession } = useAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'STAFF') {
        navigate('/staff/dashboard', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.staffLogin({ username, email: username, password });
      if (res.data.success) {
        loginSession(res.data.token, res.data.user);
        navigate('/staff/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Staff login failed. Check username or password.');
    } finally {
      setLoading(false);
    }
  };

  const currentAppName = settings.appName || brandConfig.name;

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-purple-900/5 space-y-6">
        <div className="text-center space-y-2">
          {settings.projectImage ? (
            <img
              src={settings.projectImage}
              alt={currentAppName}
              className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-pink-200 shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-200 text-pink-600 mx-auto flex items-center justify-center shadow-md shadow-pink-500/10">
              <UserCheck className="w-7 h-7" />
            </div>
          )}
          <h2 className="text-2xl font-black text-slate-900">Staff Member Portal</h2>
          <p className="text-xs text-slate-500">{currentAppName} Staff Portal Access</p>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Staff Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<UserCheck className="w-4 h-4 text-slate-400" />}
            required
          />
          <Input
            label="Security Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />

          <Button type="submit" variant="primary" className="w-full font-bold" isLoading={loading}>
            Sign In to Staff Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
};
