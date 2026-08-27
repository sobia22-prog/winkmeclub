import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { authService } from '../../services/auth.service';
import { brandConfig } from '../../config/brand.config';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
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
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      if (res.data.success) {
        loginSession(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const currentAppName = settings.appName || brandConfig.name;

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-2xl shadow-black/80 space-y-6">
        <div className="text-center space-y-2">
          {settings.projectImage ? (
            <img
              src={settings.projectImage}
              alt={currentAppName}
              className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-amber-500/40 shadow-xl"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-wine to-purple-600 mx-auto flex items-center justify-center shadow-xl shadow-brand-wine/30">
              <span className="font-extrabold text-2xl text-white">
                {currentAppName.charAt(0)}
              </span>
            </div>
          )}

          <h2 className="text-2xl font-bold text-slate-100">{currentAppName}</h2>
          <p className="text-xs text-slate-400">Sign in to access your VIP club dashboard</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-wine hover:underline font-semibold">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
