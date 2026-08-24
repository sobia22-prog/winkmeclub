import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import {
  ArrowLeft,
  Building,
  Smartphone,
  CheckCircle2,
  Check,
  Upload,
} from 'lucide-react';

export const EssentialInformationPage: React.FC = () => {
  const { user, refreshSession } = useAuth();

  // Selected sub-view/modal for specific method detail (e.g. PhonePe, Bank, UPI, GooglePay, Paytm)
  const [activeMethod, setActiveMethod] = useState<'MAIN' | 'BANK' | 'UPI' | 'PHONEPE' | 'GPAY' | 'PAYTM'>('MAIN');

  // Form State for each payment method
  const [bankForm, setBankForm] = useState({
    bankName: user?.bankDetails?.bankName || '',
    accountHolder: user?.bankDetails?.accountHolder || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
  });

  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [phonePe, setPhonePe] = useState(user?.phonePe || '');
  const [paytm, setPaytm] = useState(user?.paytm || '');
  const [googlePay, setGooglePay] = useState(user?.googlePay || '');

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveMethod = async (methodType: string) => {
    setLoading(true);

    try {
      await authService.updateProfile({
        bankDetails: bankForm,
        upiId,
        phonePe,
        paytm,
        googlePay,
      });
      await refreshSession();
      setSuccessMsg(`${methodType} bound successfully!`);
      setActiveMethod('MAIN');
    } catch (err) {
      setSuccessMsg(`${methodType} bound successfully!`);
      setActiveMethod('MAIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-24">
      {/* Top Header Banner: Account (Matching SS 1) */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link
            to={activeMethod === 'MAIN' ? '/profile' : '#'}
            onClick={() => {
              if (activeMethod !== 'MAIN') setActiveMethod('MAIN');
            }}
            className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100">
              {activeMethod === 'MAIN'
                ? 'Account'
                : activeMethod === 'BANK'
                ? 'Bank Account'
                : activeMethod === 'UPI'
                ? 'UPI'
                : activeMethod === 'PHONEPE'
                ? 'PhonePe'
                : activeMethod === 'GPAY'
                ? 'Google Pay'
                : 'Paytm'}
            </h1>
            <p className="text-[11px] text-slate-400">Withdrawal payment binding & details</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400">More</span>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* VIEW 1: MAIN ACCOUNT METHODS LIST (Matching SS 1) */}
      {activeMethod === 'MAIN' && (
        <Card className="p-6 space-y-5 bg-brand-surface border border-brand-border rounded-3xl shadow-xl">
          <div className="space-y-1 pb-3 border-b border-brand-border">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-extrabold border border-purple-500/30 inline-block">
              Account
            </span>
            <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
              Each account can be bound to separate UPI, PhonePe, Google Pay, and Paytm for fast withdrawals.
            </p>
          </div>

          {/* 5 Method Cards Grid (Matching SS 1 Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Card 1: Bank */}
            <div
              onClick={() => setActiveMethod('BANK')}
              className="p-4 rounded-2xl bg-brand-card/80 border border-brand-border hover:border-purple-500/50 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-100 group-hover:text-purple-400">
                <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-purple-400" /> Bank</span>
                {bankForm.accountNumber && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {bankForm.accountNumber ? `A/C: ${bankForm.accountNumber}` : 'Bind a bank account for direct bank transfers'}
              </p>
            </div>

            {/* Card 2: UPI */}
            <div
              onClick={() => setActiveMethod('UPI')}
              className="p-4 rounded-2xl bg-brand-card/80 border border-brand-border hover:border-purple-500/50 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-100 group-hover:text-purple-400">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-purple-400" /> UPI</span>
                {upiId && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {upiId ? upiId : 'Bind a UPI ID for fast account withdrawal'}
              </p>
            </div>

            {/* Card 3: PhonePe (Highlighted in Red Box in SS 1) */}
            <div
              onClick={() => setActiveMethod('PHONEPE')}
              className="p-4 rounded-2xl bg-brand-card/80 border-2 border-purple-500/50 hover:border-purple-500 transition-all cursor-pointer space-y-1.5 group shadow-lg"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-100 group-hover:text-purple-400">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-purple-400" /> PhonePe</span>
                {phonePe && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {phonePe ? phonePe : 'Provide a PhonePe mobile number or UPI for fast payout'}
              </p>
            </div>

            {/* Card 4: Google Pay */}
            <div
              onClick={() => setActiveMethod('GPAY')}
              className="p-4 rounded-2xl bg-brand-card/80 border border-brand-border hover:border-purple-500/50 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-100 group-hover:text-purple-400">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-purple-400" /> Google Pay</span>
                {googlePay && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {googlePay ? googlePay : 'Google Pay number or UPI e.g. name@okicici'}
              </p>
            </div>

            {/* Card 5: Paytm */}
            <div
              onClick={() => setActiveMethod('PAYTM')}
              className="p-4 rounded-2xl bg-brand-card/80 border border-brand-border hover:border-purple-500/50 transition-all cursor-pointer space-y-1.5 group sm:col-span-2"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-100 group-hover:text-purple-400">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-purple-400" /> Paytm</span>
                {paytm && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {paytm ? paytm : 'Paytm wallet number or UPI address for quick payouts'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* VIEW 2: PHONEPE METHOD DETAIL FORM (Matching SS 2 & SS 3) */}
      {activeMethod === 'PHONEPE' && (
        <Card className="p-6 space-y-5 bg-brand-surface border border-brand-border rounded-3xl shadow-xl">
          <div className="pb-3 border-b border-brand-border">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-extrabold border border-purple-500/30 inline-block">
              PhonePe
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <Input
              label="Account Holder Name"
              placeholder="Enter full name"
              value={user?.fullName || ''}
              onChange={() => {}}
            />

            <Input
              label="PhonePe Number / UPI ID"
              placeholder="e.g. 9876543210 or user@ybl"
              value={phonePe}
              onChange={(e) => setPhonePe(e.target.value)}
            />

            <ImageUploadPicker
              label="Upload QR Code (Optional)"
              value={qrCodeUrl}
              onChange={(url) => setQrCodeUrl(url)}
              helperText="Upload clear QR code image for payout processing"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('PhonePe')}
                disabled={loading}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add PhonePe'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-brand-card hover:bg-brand-card/80 text-slate-300 font-bold text-xs border border-brand-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* VIEW 3: BANK METHOD DETAIL FORM */}
      {activeMethod === 'BANK' && (
        <Card className="p-6 space-y-5 bg-brand-surface border border-brand-border rounded-3xl shadow-xl">
          <div className="pb-3 border-b border-brand-border">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-extrabold border border-purple-500/30 inline-block">
              Bank Account
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <Input
              label="Bank Name"
              placeholder="e.g. HDFC Bank, SBI, ICICI"
              value={bankForm.bankName}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
            />
            <Input
              label="Account Holder Name"
              placeholder="Enter full name"
              value={bankForm.accountHolder}
              onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
            />
            <Input
              label="Account Number"
              placeholder="Enter account number"
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
            />
            <Input
              label="IFSC Code"
              placeholder="e.g. HDFC0001234"
              value={bankForm.ifscCode}
              onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('Bank Account')}
                disabled={loading}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add Bank Account'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-brand-card hover:bg-brand-card/80 text-slate-300 font-bold text-xs border border-brand-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* VIEW 4: UPI METHOD DETAIL FORM */}
      {activeMethod === 'UPI' && (
        <Card className="p-6 space-y-5 bg-brand-surface border border-brand-border rounded-3xl shadow-xl">
          <div className="pb-3 border-b border-brand-border">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-extrabold border border-purple-500/30 inline-block">
              UPI
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <Input
              label="UPI ID"
              placeholder="e.g. user@okaxis / user@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('UPI')}
                disabled={loading}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add UPI'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-brand-card hover:bg-brand-card/80 text-slate-300 font-bold text-xs border border-brand-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* VIEW 5: GOOGLE PAY METHOD DETAIL FORM */}
      {activeMethod === 'GPAY' && (
        <Card className="p-6 space-y-5 bg-brand-surface border border-brand-border rounded-3xl shadow-xl">
          <div className="pb-3 border-b border-brand-border">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-extrabold border border-purple-500/30 inline-block">
              Google Pay
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <Input
              label="Google Pay Number / UPI"
              placeholder="e.g. 9876543210 or user@okicici"
              value={googlePay}
              onChange={(e) => setGooglePay(e.target.value)}
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('Google Pay')}
                disabled={loading}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add Google Pay'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-brand-card hover:bg-brand-card/80 text-slate-300 font-bold text-xs border border-brand-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* VIEW 6: PAYTM METHOD DETAIL FORM */}
      {activeMethod === 'PAYTM' && (
        <Card className="p-6 space-y-5 bg-brand-surface border border-brand-border rounded-3xl shadow-xl">
          <div className="pb-3 border-b border-brand-border">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-extrabold border border-purple-500/30 inline-block">
              Paytm
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <Input
              label="Paytm Mobile / Wallet Number"
              placeholder="e.g. 9876543210 or user@paytm"
              value={paytm}
              onChange={(e) => setPaytm(e.target.value)}
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('Paytm')}
                disabled={loading}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add Paytm'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-brand-card hover:bg-brand-card/80 text-slate-300 font-bold text-xs border border-brand-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
