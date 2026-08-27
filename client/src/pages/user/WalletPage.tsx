import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { walletService } from '../../services/wallet.service';
import { RechargeRequest, WithdrawalRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  History,
  CheckCircle2,
  Send,
  Coins,
  Copy,
  Check,
  Eye,
  ExternalLink,
  MessageCircle,
  QrCode,
  Building,
  Smartphone,
  ChevronLeft,
  Upload,
  ArrowLeft,
} from 'lucide-react';

interface WalletPageProps {
  initialTab?: 'overview' | 'recharge' | 'withdraw';
}

export const WalletPage: React.FC<WalletPageProps> = ({ initialTab }) => {
  const { wallet, refreshSession } = useAuth();
  const { settings } = useSystemSettings();
  const location = useLocation();

  let activeView = initialTab || 'recharge';
  if (location.pathname.includes('/recharge')) activeView = 'recharge';
  if (location.pathname.includes('/withdraw')) activeView = 'withdraw';

  const [currentTab, setCurrentTab] = useState<'overview' | 'recharge' | 'withdraw'>(activeView);
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  const currencySymbol = settings.currencySymbol || '₹';

  // Recharge Form State (Matching SS 3)
  const [rechargeForm, setRechargeForm] = useState({
    amount: 1000,
    paymentMethod: 'UPI / Bank Transfer',
    referenceNumber: '',
    receiptUrl: '',
  });

  // Withdraw Form State
  const [withdrawForm, setWithdrawForm] = useState({
    amount: 1000,
    paymentMethod: 'UPI ID',
    accountHolder: '',
    upiId: '',
    qrCodeUrl: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchHistory = async () => {
    try {
      const [rcgRes, wtdRes] = await Promise.all([
        walletService.getMyRecharges(),
        walletService.getMyWithdrawals(),
      ]);
      if (rcgRes.data.success) setRecharges(rcgRes.data.recharges);
      if (wtdRes.data.success) setWithdrawals(wtdRes.data.withdrawals);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await walletService.submitRecharge(rechargeForm);
      if (res.data.success) {
        setSuccessMsg('Recharge request submitted successfully! Pending admin verification.');
        setRechargeForm({
          amount: 1000,
          paymentMethod: 'UPI / Bank Transfer',
          referenceNumber: '',
          receiptUrl: '',
        });
        fetchHistory();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Recharge request submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await walletService.submitWithdrawal(withdrawForm);
      if (res.data.success) {
        setSuccessMsg('Withdrawal request submitted! Funds moved to frozen balance.');
        fetchHistory();
        refreshSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  const [rechargeMethod, setRechargeMethod] = useState<'CRYPTO' | 'BANK'>('CRYPTO');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const usdtExchangeRate = settings.usdtExchangeRate || 92;
  const usdtWalletAddress = settings.usdtWalletAddress || 'TXYZ987654321WinkMeClubUSDTDepositAddr';

  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText(usdtWalletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-extrabold text-slate-100">
            {currentTab === 'recharge' ? 'Recharge Wallet' : currentTab === 'withdraw' ? 'Withdraw Wallet' : 'Finances & Wallet'}
          </h1>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-brand-surface p-1 border border-brand-border rounded-xl">
          <button
            type="button"
            onClick={() => setCurrentTab('recharge')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'recharge' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recharge
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('withdraw')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'withdraw' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Withdraw
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-between shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* VIEW 1: RECHARGE WALLET */}
      {currentTab === 'recharge' && (
        <div className="space-y-6">
          {/* Method Selector Bar */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setRechargeMethod('CRYPTO');
                setRechargeForm({ ...rechargeForm, paymentMethod: 'USDT TRC20 Crypto Deposit' });
              }}
              className={`p-3.5 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                rechargeMethod === 'CRYPTO'
                  ? 'border-purple-500 bg-purple-500/20 text-white shadow-lg'
                  : 'border-brand-border bg-brand-surface text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4 text-amber-400" /> Crypto Deposit (USDT)
            </button>

            <button
              type="button"
              onClick={() => {
                setRechargeMethod('BANK');
                setRechargeForm({ ...rechargeForm, paymentMethod: 'UPI / Bank Transfer' });
              }}
              className={`p-3.5 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                rechargeMethod === 'BANK'
                  ? 'border-purple-500 bg-purple-500/20 text-white shadow-lg'
                  : 'border-brand-border bg-brand-surface text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-4 h-4 text-emerald-400" /> UPI / Bank Transfer
            </button>
          </div>

          <form onSubmit={handleRechargeSubmit} className="space-y-6">
            {/* CRYPTO DEPOSIT DETAILS CARD */}
            {rechargeMethod === 'CRYPTO' && (
              <Card className="p-5 space-y-4 bg-brand-surface border border-purple-500/40 rounded-3xl shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <div className="flex items-center gap-2 font-extrabold text-slate-100 text-sm">
                    <QrCode className="w-5 h-5 text-amber-400" /> USDT TRC20 Crypto Deposit
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[10px]">
                    TRC20 Network
                  </span>
                </div>

                {/* Official Allowed Exchange Rate Banner */}
                <div className="p-3.5 bg-gradient-to-r from-purple-950/60 to-brand-card border border-purple-500/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Allowed Exchange Rate</span>
                    <span className="text-sm font-black text-amber-400 font-mono">1 USDT = {currencySymbol}{usdtExchangeRate.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold">
                    Official Rate Allowed
                  </span>
                </div>

                {/* USDT TRC20 Wallet Address Box */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Official USDT TRC20 Deposit Address
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-brand-dark border border-brand-border rounded-2xl">
                    <span className="font-mono text-xs text-slate-200 truncate flex-1 font-bold">
                      {usdtWalletAddress}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWalletAddress}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all shrink-0"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAddress ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Deposit Amount Input */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">Deposit Amount (USDT)</label>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">
                      Equivalent: {currencySymbol}{(rechargeForm.amount * usdtExchangeRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    placeholder="e.g. 100 USDT"
                    value={rechargeForm.amount}
                    onChange={(e) => setRechargeForm({ ...rechargeForm, amount: Number(e.target.value) })}
                    className="w-full bg-brand-dark border border-brand-border rounded-2xl px-4 py-3 text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Preset Amount Pills */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[10, 50, 100, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeForm({ ...rechargeForm, amount: amt })}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all ${
                        rechargeForm.amount === amt
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                          : 'bg-brand-card border-brand-border text-slate-300 hover:border-purple-500/40'
                      }`}
                    >
                      {amt} USDT
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* UPI / BANK DEPOSIT DETAILS CARD */}
            {rechargeMethod === 'BANK' && (
              <Card className="p-5 space-y-4 bg-brand-surface border border-brand-border rounded-3xl shadow-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center border border-purple-500/40">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Step 1: Enter Amount</h3>
                    <p className="text-[11px] text-slate-400">Choose an amount or enter custom amount to add</p>
                  </div>
                </div>

                {/* Custom Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-slate-300">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={rechargeForm.amount}
                    onChange={(e) => setRechargeForm({ ...rechargeForm, amount: Number(e.target.value) })}
                    className="w-full bg-brand-dark border border-brand-border rounded-2xl px-4 py-3 text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Quick Amount Preset Pills */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeForm({ ...rechargeForm, amount: amt })}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all ${
                        rechargeForm.amount === amt
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                          : 'bg-brand-card border-brand-border text-slate-300 hover:border-purple-500/40'
                      }`}
                    >
                      {currencySymbol}{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* STEP 2: UPLOAD PAYMENT PROOF */}
            <Card className="p-5 space-y-4 bg-brand-surface border border-brand-border rounded-3xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center border border-purple-500/40">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Step 2: Upload Deposit Proof</h3>
                  <p className="text-[11px] text-slate-400">
                    {rechargeMethod === 'CRYPTO' ? 'Upload blockchain transfer screenshot & TxHash' : 'Upload payment proof / screenshot to verify transaction'}
                  </p>
                </div>
              </div>

              {/* Payment Screenshot Picker */}
              <ImageUploadPicker
                label={rechargeMethod === 'CRYPTO' ? 'Crypto Transfer Screenshot' : 'Payment Screenshot'}
                value={rechargeForm.receiptUrl}
                onChange={(url) => setRechargeForm({ ...rechargeForm, receiptUrl: url })}
                helperText="Upload payment screenshot proof for Admin verification"
              />

              {/* Transaction ID / TxHash Number Input */}
              <Input
                label={rechargeMethod === 'CRYPTO' ? 'TxHash / Transaction Hash' : 'Transaction ID / UTR Number'}
                placeholder={rechargeMethod === 'CRYPTO' ? 'Enter TRC20 TxHash (e.g. 0x8a7...)' : 'Transaction ID / UTR Number'}
                value={rechargeForm.referenceNumber}
                onChange={(e) => setRechargeForm({ ...rechargeForm, referenceNumber: e.target.value })}
                required
              />

              {/* Submit Recharge Request Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : rechargeMethod === 'CRYPTO' ? 'Submit Crypto Deposit Request' : 'Submit Recharge Request'}
              </button>
            </Card>
          </form>

          {/* MY RECHARGE REQUESTS HISTORY (Matching SS 3) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-100">My Recharge Requests</h3>

            {recharges.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-500">No recharge requests submitted yet.</Card>
            ) : (
              <div className="space-y-3">
                {recharges.map((r) => (
                  <div key={r._id} className="p-4 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-between text-xs shadow-md">
                    <div className="space-y-1">
                      <div className="font-mono font-bold text-slate-100">{r.requestId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Ref: {r.referenceNumber}</div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-black text-emerald-400 text-sm">+{currencySymbol}{r.amount.toLocaleString()}</div>
                      <div>
                        {r.status === 'APPROVED' && <Badge variant="success">APPROVED</Badge>}
                        {r.status === 'PENDING' && <Badge variant="pending">PENDING</Badge>}
                        {r.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: WITHDRAW WALLET */}
      {currentTab === 'withdraw' && (
        <form onSubmit={handleWithdrawSubmit} className="space-y-5">
          <Card className="p-5 space-y-4 bg-brand-surface border border-brand-border rounded-3xl shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-100">Request Payout Withdrawal</h3>

            <Select
              label="Select Payout Method"
              value={withdrawForm.paymentMethod}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, paymentMethod: e.target.value })}
              options={[
                { label: '1. UPI (ID)', value: 'UPI ID' },
                { label: '2. QR Code (Upload Photo of QR)', value: 'QR Code' },
                { label: '3. Bank Account', value: 'Bank Account' },
              ]}
            />

            <Input
              label={`Withdrawal Amount (${currencySymbol})`}
              type="number"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: Number(e.target.value) })}
              required
            />

            {withdrawForm.paymentMethod === 'UPI ID' && (
              <div className="space-y-3 p-4 bg-brand-card rounded-2xl border border-brand-border">
                <Input
                  label="UPI ID (e.g. user@upi)"
                  placeholder="name@okaxis / user@upi"
                  value={withdrawForm.upiId}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, upiId: e.target.value })}
                  required
                />
                <Input
                  label="Account Holder Name"
                  placeholder="Enter full name on UPI account"
                  value={withdrawForm.accountHolder}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                  required
                />
              </div>
            )}

            {withdrawForm.paymentMethod === 'QR Code' && (
              <div className="space-y-3 p-4 bg-brand-card rounded-2xl border border-brand-border">
                <Input
                  label="Account Holder Name"
                  placeholder="Enter full name of QR holder"
                  value={withdrawForm.accountHolder}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                  required
                />
                <ImageUploadPicker
                  label="Upload Photo of your Payment QR Code"
                  value={withdrawForm.qrCodeUrl}
                  onChange={(url) => setWithdrawForm({ ...withdrawForm, qrCodeUrl: url })}
                  helperText="Upload clear QR code image for Admin payout processing"
                />
              </div>
            )}

            {withdrawForm.paymentMethod === 'Bank Account' && (
              <div className="space-y-3 p-4 bg-brand-card rounded-2xl border border-brand-border">
                <Input
                  label="Bank Name"
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  value={withdrawForm.bankName}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                  required
                />
                <Input
                  label="Account Holder Name"
                  placeholder="Enter full account holder name"
                  value={withdrawForm.accountHolder}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                  required
                />
                <Input
                  label="Bank Account Number"
                  placeholder="Enter account number"
                  value={withdrawForm.accountNumber}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                  required
                />
                <Input
                  label="IFSC Code"
                  placeholder="e.g. HDFC0001234"
                  value={withdrawForm.ifscCode}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value })}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </Card>
        </form>
      )}
    </div>
  );
};
