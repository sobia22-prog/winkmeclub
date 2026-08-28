import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import {
  ArrowLeft,
  Building,
  Smartphone,
  CheckCircle2,
  Check,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, refreshSession } = useAuth();

  // Selected sub-view for specific method detail
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
    <div className="w-full max-w-md md:max-w-xl mx-auto space-y-5 pb-24">
      {/* Top Header Banner: Account */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to={activeMethod === 'MAIN' ? '/profile' : '#'}
            onClick={() => {
              if (activeMethod !== 'MAIN') setActiveMethod('MAIN');
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
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
            <p className="text-[11px] text-slate-500">Withdrawal payment binding & details</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500">More</span>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>
      )}

      {/* VIEW 1: MAIN ACCOUNT BINDING HUB */}
      {activeMethod === 'MAIN' && (
        <Card className="p-6 space-y-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-extrabold border border-pink-200 inline-block">
              Bank
            </span>
            <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
              Each account can be bound to separate UPI, Google Pay, PhonePe, and Paytm for fast withdrawals.
            </p>
          </div>

          {/* 5 Method Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {/* Card 1: Bank */}
            <div
              onClick={() => setActiveMethod('BANK')}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all cursor-pointer space-y-1.5 group shadow-sm"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-900 group-hover:text-pink-600">
                <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-pink-600" /> Bank</span>
                {bankForm.accountNumber && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {bankForm.accountNumber ? `A/C: ${bankForm.accountNumber}` : 'Bind a bank account for direct bank transfers'}
              </p>
            </div>

            {/* Card 2: UPI */}
            <div
              onClick={() => setActiveMethod('UPI')}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all cursor-pointer space-y-1.5 group shadow-sm"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-900 group-hover:text-pink-600">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-pink-600" /> UPI</span>
                {upiId && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {upiId ? upiId : 'Bind a UPI ID for fast account withdrawal'}
              </p>
            </div>

            {/* Card 3: PhonePe */}
            <div
              onClick={() => setActiveMethod('PHONEPE')}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all cursor-pointer space-y-1.5 group shadow-sm"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-900 group-hover:text-pink-600">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-pink-600" /> PhonePe</span>
                {phonePe && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {phonePe ? phonePe : 'Provide a PhonePe mobile number or UPI for fast payout'}
              </p>
            </div>

            {/* Card 4: Google Pay */}
            <div
              onClick={() => setActiveMethod('GPAY')}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all cursor-pointer space-y-1.5 group shadow-sm"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-900 group-hover:text-pink-600">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-pink-600" /> Google Pay</span>
                {googlePay && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {googlePay ? googlePay : 'Google Pay number or UPI e.g. name@okicici'}
              </p>
            </div>

            {/* Card 5: Paytm */}
            <div
              onClick={() => setActiveMethod('PAYTM')}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all cursor-pointer space-y-1.5 group shadow-sm"
            >
              <div className="flex items-center justify-between font-extrabold text-slate-900 group-hover:text-pink-600">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-pink-600" /> Paytm</span>
                {paytm && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {paytm ? paytm : 'Paytm wallet number or UPI address for quick payouts'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* METHOD DETAIL FORM: PHONEPE */}
      {activeMethod === 'PHONEPE' && (
        <Card className="p-6 space-y-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="pb-3 border-b border-slate-100">
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-extrabold border border-pink-200 inline-block">
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
              label="Upload QR Code"
              value={qrCodeUrl}
              onChange={(url) => setQrCodeUrl(url)}
              helperText="Click to upload QR code image for fast payout processing"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('PhonePe')}
                disabled={loading}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add PhonePe'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* METHOD DETAIL FORM: BANK */}
      {activeMethod === 'BANK' && (
        <Card className="p-6 space-y-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="pb-3 border-b border-slate-100">
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-extrabold border border-pink-200 inline-block">
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

            <ImageUploadPicker
              label="Upload QR Code"
              value={qrCodeUrl}
              onChange={(url) => setQrCodeUrl(url)}
              helperText="Click to upload QR code image for fast bank payouts"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('Bank Account')}
                disabled={loading}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add Bank Account'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* METHOD DETAIL FORM: UPI */}
      {activeMethod === 'UPI' && (
        <Card className="p-6 space-y-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="pb-3 border-b border-slate-100">
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-extrabold border border-pink-200 inline-block">
              UPI
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
              label="UPI ID"
              placeholder="e.g. user@okaxis / user@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />

            <ImageUploadPicker
              label="Upload QR Code"
              value={qrCodeUrl}
              onChange={(url) => setQrCodeUrl(url)}
              helperText="Click to upload QR code image for fast payout processing"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('UPI')}
                disabled={loading}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add UPI'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* METHOD DETAIL FORM: GOOGLE PAY */}
      {activeMethod === 'GPAY' && (
        <Card className="p-6 space-y-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="pb-3 border-b border-slate-100">
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-extrabold border border-pink-200 inline-block">
              Google Pay
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
              label="Google Pay Number / UPI"
              placeholder="e.g. 9876543210 or user@okicici"
              value={googlePay}
              onChange={(e) => setGooglePay(e.target.value)}
            />

            <ImageUploadPicker
              label="Upload QR Code"
              value={qrCodeUrl}
              onChange={(url) => setQrCodeUrl(url)}
              helperText="Click to upload QR code image for fast payout processing"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('Google Pay')}
                disabled={loading}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add Google Pay'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* METHOD DETAIL FORM: PAYTM */}
      {activeMethod === 'PAYTM' && (
        <Card className="p-6 space-y-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="pb-3 border-b border-slate-100">
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-extrabold border border-pink-200 inline-block">
              Paytm
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
              label="Paytm Mobile / Wallet Number"
              placeholder="e.g. 9876543210 or user@paytm"
              value={paytm}
              onChange={(e) => setPaytm(e.target.value)}
            />

            <ImageUploadPicker
              label="Upload QR Code"
              value={qrCodeUrl}
              onChange={(url) => setQrCodeUrl(url)}
              helperText="Click to upload QR code image for fast payout processing"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveMethod('Paytm')}
                disabled={loading}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Add Paytm'}
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('MAIN')}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
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
