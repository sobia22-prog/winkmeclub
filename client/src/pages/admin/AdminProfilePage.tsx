import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { adminService } from '../../services/admin.service';
import { systemSettingsService } from '../../services/systemSettings.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { User, Mail, Lock, CheckCircle2, ShieldCheck, Sliders, Globe, DollarSign, Image as ImageIcon, Wrench, Languages } from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user: adminUser, refreshSession } = useAuth();
  const { settings, refreshSettings } = useSystemSettings();

  // General Settings Form State
  const [appName, setAppName] = useState(settings.appName || 'Wink Me Club');
  const [defaultCurrency, setDefaultCurrency] = useState<'INR' | 'EUR' | 'USD'>(settings.defaultCurrency || 'INR');
  const [projectImage, setProjectImage] = useState(settings.projectImage || '');
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(settings.maintenanceMode || false);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'support@winkmeclub.com');
  const [defaultLanguage, setDefaultLanguage] = useState(settings.defaultLanguage || 'English');

  // Admin Profile Credentials State
  const [credForm, setCredForm] = useState({
    fullName: adminUser?.fullName || 'System Administrator',
    email: adminUser?.email || 'admin@winkmedatingclub.com',
    password: '',
  });

  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      if (settings.appName) setAppName(settings.appName);
      if (settings.defaultCurrency) setDefaultCurrency(settings.defaultCurrency);
      if (settings.projectImage !== undefined) setProjectImage(settings.projectImage);
      if (settings.maintenanceMode !== undefined) setMaintenanceMode(settings.maintenanceMode);
      if (settings.supportEmail) setSupportEmail(settings.supportEmail);
      if (settings.defaultLanguage) setDefaultLanguage(settings.defaultLanguage);
    }
  }, [settings]);

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGeneral(true);
    setMessage('');
    setError('');

    try {
      const res = await systemSettingsService.updateSettings({
        appName,
        defaultCurrency,
        projectImage,
        maintenanceMode,
        supportEmail,
        defaultLanguage,
      });

      if (res.data.success) {
        setMessage('General website settings updated and applied globally across all panels!');
        await refreshSettings();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update general settings.');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCreds(true);
    setMessage('');
    setError('');

    try {
      const res = await adminService.updateAdminSettings(credForm);
      if (res.data.success) {
        setMessage('Profile account credentials updated successfully!');
        setCredForm((prev) => ({ ...prev, password: '' }));
        refreshSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setSavingCreds(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-pink-600" /> Admin & Website Profile Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure global website settings, default currency, branding logo, maintenance mode, and admin security credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 border border-pink-200 rounded-full text-xs font-bold text-pink-700 shrink-0">
          <ShieldCheck className="w-4 h-4 text-pink-600" /> {adminUser?.role === 'STAFF' ? 'STAFF MEMBER ACCESS' : 'SUPER ADMIN ACCESS'}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold shadow-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* SECTION 1: GENERAL SETTINGS */}
      <Card className="p-6 md:p-8 space-y-6 w-full bg-white border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-pink-600" /> General Settings
          </h2>
          <p className="text-xs text-slate-500">Global brand configuration applied throughout user, staff, and admin panels.</p>
        </div>

        <form onSubmit={handleSaveGeneralSettings} className="space-y-6 w-full text-xs">
          {/* App Name & Default Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="App Name"
              placeholder="Wink Me Club"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              leftIcon={<Globe className="w-4 h-4 text-pink-600" />}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-pink-600" /> Default Currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-pink-500 transition-colors shadow-sm"
              >
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Project Image (Logo) with Upload Image & Remove buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-pink-600" /> Project Image
            </label>
            <p className="text-[11px] text-slate-500">
              Logo shown on login, user dashboard, and admin sidebar. Recommended: square PNG/JPG, at least 128x128.
            </p>

            <ImageUploadPicker
              value={projectImage}
              onChange={(url) => setProjectImage(url)}
              label=""
              helperText="Upload custom logo image"
              showActionButtons={true}
            />
          </div>

          {/* Maintenance Mode Toggle Checkbox */}
          <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-pink-700 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-pink-600" /> Maintenance Mode
              </span>
              <p className="text-[11px] text-slate-600 font-medium">
                Disable the app for all users temporarily during maintenance upgrades.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {/* Support Email & Default Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Support Email"
              type="email"
              placeholder="support@winkmeclub.com"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-pink-600" />}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-pink-600" /> Default Language
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs font-bold focus:outline-none focus:border-pink-500 transition-colors shadow-sm"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end border-t border-slate-100">
            <Button variant="primary" type="submit" isLoading={savingGeneral}>
              Save General Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* SECTION 2: ADMIN CREDENTIALS */}
      <Card className="p-6 md:p-8 space-y-6 w-full bg-white border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-pink-600" /> {adminUser?.role === 'STAFF' ? 'Staff Profile Credentials' : 'Admin Profile Credentials'}
          </h2>
          <p className="text-xs text-slate-500">
            {adminUser?.role === 'STAFF' ? 'Manage your staff display name, login email, and security password.' : 'Manage administrator display name, login email, and security password.'}
          </p>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-5 w-full text-xs">
          <Input
            label="Display Name / Full Name"
            value={credForm.fullName}
            onChange={(e) => setCredForm({ ...credForm, fullName: e.target.value })}
            leftIcon={<User className="w-4 h-4 text-pink-600" />}
            required
          />

          <Input
            label="Login Email Address"
            type="email"
            value={credForm.email}
            onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4 text-pink-600" />}
            required
          />

          <Input
            label="New Password (leave blank to keep current password)"
            type="password"
            placeholder="Enter new password..."
            value={credForm.password}
            onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
            leftIcon={<Lock className="w-4 h-4 text-pink-600" />}
          />

          <div className="pt-2 flex justify-end border-t border-slate-100">
            <Button variant="secondary" type="submit" isLoading={savingCreds}>
              Save Profile Credentials
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
