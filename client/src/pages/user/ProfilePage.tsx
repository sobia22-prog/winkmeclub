import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { brandConfig } from '../../config/brand.config';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  User as UserIcon,
  Wallet,
  ShoppingBag,
  History,
  Bell,
  Headphones,
  ShieldCheck,
  Phone,
  Save,
  CheckCircle2,
  ChevronRight,
  Upload,
  LogOut,
  Edit3,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, wallet, logout, refreshSession } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    city: user?.city || 'Mumbai',
    gender: user?.gender || 'Female',
    profileImage: user?.profileImage || '',
    bio: user?.bio || '',
    interests: user?.interests ? user.interests.join(', ') : '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Selected image exceeds 5MB size limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const interestsArray = formData.interests
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const res = await authService.updateProfile({
        ...formData,
        interests: interestsArray,
      });

      if (res.data.success) {
        setMessage('Profile updated successfully!');
        await refreshSession();
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const menuHubOptions = [
    {
      title: 'Wallet & Add Funds',
      description: 'Manage available balance, add funds, & bank withdrawals',
      path: '/wallet',
      icon: <Wallet className="w-6 h-6 text-emerald-400" />,
      badge: `Available: ₹${wallet?.availableBalance.toLocaleString('en-IN') || '0'}`,
    },
    {
      title: 'Product Trading Marketplace',
      description: 'Trade luxury lifestyle products & track position holds',
      path: '/trades',
      icon: <ShoppingBag className="w-6 h-6 text-amber-400" />,
      badge: 'Trading Active',
    },

    {
      title: 'Notification Center',
      description: 'View date proposals, trade outcomes, & system alerts',
      path: '/notifications',
      icon: <Bell className="w-6 h-6 text-brand-wine" />,
    },
    {
      title: 'Customer Concierge Support',
      description: 'Open a ticket or chat with 24/7 support concierge',
      path: '/support',
      icon: <Headphones className="w-6 h-6 text-pink-400" />,
    },
    {
      title: 'VIP Verification Status',
      description: 'ID document upload & Gold VIP badge verification',
      path: '/verification',
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      badge: user?.isVIP ? 'VIP ACTIVE' : 'Get Verified',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Notification Banner if recently updated */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Clean User Header Summary Card */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 border-l-brand-wine p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={
              user?.profileImage ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
            }
            alt={user?.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-wine shadow-xl shrink-0"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-extrabold text-slate-100">{user?.fullName}</h1>
              {user?.isVIP && <Badge variant="vip" />}
              {user?.verificationStatus === 'VERIFIED' && <Badge variant="verified" />}
            </div>
            <p className="text-xs text-slate-400">{user?.email} • 📍 {user?.city}</p>
            <p className="text-xs text-slate-300 italic">"{user?.bio || 'VIP Member'}"</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
          <button
            onClick={logout}
            className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </Card>

      {/* Wallet Balance Summary Card */}
      <Card className="bg-gradient-to-r from-brand-surface via-brand-card to-brand-surface border border-brand-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" /> Wallet Balance Overview
          </h3>
          <Link to="/wallet">
            <Button variant="secondary" size="sm">
              Manage Wallet →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 bg-brand-surface rounded-xl border border-brand-border">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
            <span className="text-xl font-extrabold text-emerald-400">
              ₹{wallet?.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>

          <div className="p-3.5 bg-brand-surface rounded-xl border border-brand-border">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Frozen Balance</span>
            <span className="text-xl font-extrabold text-amber-400">
              ₹{wallet?.frozenBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
        </div>
      </Card>

      {/* Account Menu Hub Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-100">Account Services & Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuHubOptions.map((opt) => (
            <Link key={opt.path} to={opt.path}>
              <Card hoverEffect className="p-5 flex items-center justify-between gap-4 h-full group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-card rounded-2xl border border-brand-border group-hover:scale-105 transition-transform">
                    {opt.icon}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-brand-wine transition-colors">
                        {opt.title}
                      </h4>
                      {opt.badge && <Badge variant="neutral" size="sm">{opt.badge}</Badge>}
                    </div>
                    <p className="text-xs text-slate-400">{opt.description}</p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Information"
      >
        <div className="space-y-5">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden File Picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileSelect}
            />

            {/* Photo Upload Card */}
            <div className="p-4 bg-brand-card border border-brand-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={
                    formData.profileImage ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
                  }
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-brand-border shadow-md shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Profile Photo</h4>
                  <p className="text-[11px] text-slate-400">JPG, PNG or WEBP up to 5MB</p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo File
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="City Location"
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

            <Textarea
              label="Bio & About Yourself"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Tell others about your interests, passions..."
            />

            <Input
              label="Interests (comma separated)"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="Fine Dining, Travel, Art, Cryptocurrencies"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
