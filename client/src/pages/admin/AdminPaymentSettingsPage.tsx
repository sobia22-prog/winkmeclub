import React, { useState, useEffect } from 'react';
import { systemSettingsService, SystemSettingsData } from '../../services/systemSettings.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Settings, Send, MessageCircle, QrCode, DollarSign, Building, CheckCircle2 } from 'lucide-react';

export const AdminPaymentSettingsPage: React.FC = () => {
  const [form, setForm] = useState<SystemSettingsData>({
    telegramFinanceLink: 'https://t.me/winkmedatingclub_finance',
    telegramSupportLink: 'https://t.me/winkmedatingclub_support',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" /> Telegram & Payment Settings
          </h1>
          <p className="text-xs text-slate-400">Configure your official Telegram handles, USDT crypto deposit wallet, and exchange rate live.</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 space-y-1">
            <strong>📢 Live Dynamic Synchronization:</strong>
            <p className="text-[11px] text-slate-300">
              Any changes saved here will instantly update the user Wallet deposit screen (`/wallet`) and Support page (`/support`) in real-time.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" /> Telegram Official Handles
            </h3>

            <Input
              label="Telegram Finance Link (Add Funds / Deposit Chat)"
              value={form.telegramFinanceLink}
              onChange={(e) => setForm({ ...form, telegramFinanceLink: e.target.value })}
              leftIcon={<Send className="w-4 h-4 text-sky-400" />}
              helperText="Users click this link on /wallet to talk to your Finance Department"
              required
            />

            <Input
              label="Telegram 24/7 Customer Support Link"
              value={form.telegramSupportLink}
              onChange={(e) => setForm({ ...form, telegramSupportLink: e.target.value })}
              leftIcon={<MessageCircle className="w-4 h-4 text-sky-400" />}
              helperText="Users click this link on /support for 24/7 VIP assistance"
              required
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-brand-border">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" /> USDT Crypto Deposit Settings
            </h3>

            <Input
              label="USDT TRC20 Wallet Address"
              value={form.usdtWalletAddress}
              onChange={(e) => setForm({ ...form, usdtWalletAddress: e.target.value })}
              leftIcon={<QrCode className="w-4 h-4 text-amber-400" />}
              helperText="Your official TRC20 wallet address displayed on the USDT deposit tab"
              required
            />

            <Input
              label="USDT Exchange Rate (INR ₹ per 1 USDT)"
              type="number"
              value={form.usdtExchangeRate}
              onChange={(e) => setForm({ ...form, usdtExchangeRate: Number(e.target.value) })}
              leftIcon={<DollarSign className="w-4 h-4 text-emerald-400" />}
              helperText="Rate used to convert user deposit amounts to USDT (Default: 92.00)"
              required
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-brand-border">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" /> Optional Bank & UPI Chat Details
            </h3>

            <Input
              label="Admin UPI ID"
              value={form.adminUpiId}
              onChange={(e) => setForm({ ...form, adminUpiId: e.target.value })}
              leftIcon={<Building className="w-4 h-4 text-purple-400" />}
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
            <Button variant="gold" type="submit" isLoading={loading}>
              Save Payment Settings Live
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
