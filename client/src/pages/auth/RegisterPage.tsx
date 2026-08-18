import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { brandConfig } from '../../config/brand.config';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { User, Mail, Phone, Lock, MapPin } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'Mumbai',
    gender: 'Female',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register(formData);
      if (res.data.success) {
        navigate('/verify-otp', {
          state: { email: formData.email, otpDemoHint: res.data.otpDemoHint },
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-100">Join {brandConfig.name}</h2>
          <p className="text-xs text-slate-400">Create your account to explore VIP membership</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            leftIcon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@domain.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              options={brandConfig.cities.map((c) => ({ label: c, value: c }))}
            />
            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { label: 'Female', value: 'Female' },
                { label: 'Male', value: 'Male' },
                { label: 'Non-Binary', value: 'Non-Binary' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-wine hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
