import React, { useState, useEffect } from 'react';
import { systemSettingsService, SystemSettingsData } from '../../services/systemSettings.service';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { Settings, Send, MessageCircle, QrCode, DollarSign, Building, CheckCircle2 } from 'lucide-react';

export const AdminPaymentSettingsPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';
  const [form, setForm] = useState<SystemSettingsData>({
    telegramFinanceLink: 'https://t.me/winkmedatingclub_finance',
    telegramSupportLink: 'https://t.me/winkmedatingclub_support',
    telegramSupportQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://t.me/winkmedatingclub_support',
    usdtWalletAddress: 'TXYZ987654321WinkMeClubUSDTDepositAddr',
    usdtExchangeRate: 92,
    adminUpiId: 'winkmeclub@upi',
    bankName: 'HDFC Bank',
    accountHolder: 'Wink Me Club Financial Services',
    accountNumber: '50100298371234',
    ifscCode: 'HDFC0000128',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    systemSettingsService
      .getSettings()
      .then((res) => {
        if (res.data.success && res.data.settings) {
          setForm((prev) => ({ ...prev, ...res.data.settings }));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await systemSettingsService.updateSettings(form);
      if (res.data.success) {
        setMessage('Telegram links, USDT wallet address, & bank deposit settings updated live!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update payment settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-pink-600" /> Telegram & Payment Settings
          </h1>
          <p className="text-xs text-slate-500">Configure your official Telegram handles, USDT crypto deposit wallet, and exchange rate live.</p>
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
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      <Card className="p-6 md:p-8 space-y-6 w-full bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
            <strong>📢 Live Dynamic Synchronization:</strong>
            <p className="text-[11px] text-emerald-700 font-medium">
              Any changes saved here will instantly update the user Wallet deposit screen (`/wallet`) and Support page (`/support`) in real-time.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-600" /> Telegram Official Handles
            </h3>

            <Input
              label="Telegram Finance Link (Add Funds / Deposit Chat)"
              value={form.telegramFinanceLink}
              onChange={(e) => setForm({ ...form, telegramFinanceLink: e.target.value })}
              leftIcon={<Send className="w-4 h-4 text-sky-600" />}
              helperText="Users click this link on /wallet to talk to your Finance Department"
              required
            />

            <Input
              label="Telegram 24/7 Customer Support Link"
              value={form.telegramSupportLink}
              onChange={(e) => setForm({ ...form, telegramSupportLink: e.target.value })}
              leftIcon={<MessageCircle className="w-4 h-4 text-sky-600" />}
              helperText="Users click this link on /support for 24/7 VIP assistance"
              required
            />

            <ImageUploadPicker
              label="Telegram Support Account QR Code Image (Upload or Paste URL)"
              value={form.telegramSupportQrCode || ''}
              onChange={(url) => setForm({ ...form, telegramSupportQrCode: url })}
              helperText="Upload your custom Telegram account QR Code image. Users will scan this on /support page."
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <QrCode className="w-4 h-4 text-pink-600" /> USDT Crypto Deposit Settings
            </h3>

            <Input
              label="USDT TRC20 Wallet Address"
              value={form.usdtWalletAddress}
              onChange={(e) => setForm({ ...form, usdtWalletAddress: e.target.value })}
              leftIcon={<QrCode className="w-4 h-4 text-pink-600" />}
              helperText="Your official TRC20 wallet address displayed on the USDT deposit tab"
              required
            />

            <Input
              label={`USDT Exchange Rate (${settings.defaultCurrency || 'Local Currency'} ${currencySymbol} per 1 USDT)`}
              type="number"
              value={form.usdtExchangeRate}
              onChange={(e) => setForm({ ...form, usdtExchangeRate: Number(e.target.value) })}
              leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
              helperText="Rate used to convert user deposit amounts to USDT (Default: 92.00)"
              required
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" /> Optional Bank & UPI Chat Details
            </h3>

            <Input
              label="Admin UPI ID"
              value={form.adminUpiId}
              onChange={(e) => setForm({ ...form, adminUpiId: e.target.value })}
              leftIcon={<Building className="w-4 h-4 text-purple-600" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              />
              <Input
                label="Account Holder Name"
                value={form.accountHolder}
                onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
              />
              <Input
                label="Account Number"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              />
              <Input
                label="IFSC Code"
                value={form.ifscCode}
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" type="submit" isLoading={loading}>
              Save Payment Settings Live
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
