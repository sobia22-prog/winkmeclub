import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
import { brandConfig } from '../../config/brand.config';
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
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { wallet, refreshSession } = useAuth();
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Custom Admin USDT Dollar Rate & Wallet Address
  const usdtRateINR = 92.0; // ₹92 per 1 USDT
  const cryptoDepositAddress = 'TXYZ987654321WinkMeClubUSDTDepositAddr';
  const telegramFinanceUrl = 'https://t.me/winkmedatingclub_finance';

  // Recharge Form
  const [rechargeForm, setRechargeForm] = useState({
    amount: 5000,
    paymentMethod: 'Finance Department (Person-to-Person Telegram)',
    referenceNumber: '',
    receiptUrl: '',
  });

  // Withdrawal Form
  const [withdrawForm, setWithdrawForm] = useState({
    amount: 2000,
    bankName: 'HDFC Bank',
    accountHolder: '',
    accountNumber: '',
    ifscCode: 'HDFC0001234',
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

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cryptoDepositAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await walletService.submitRecharge(rechargeForm);
      if (res.data.success) {
        setSuccessMsg('Add-funds deposit request submitted! Admin will verify payment & credit wallet.');
        setShowRechargeModal(false);
        fetchHistory();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Recharge submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await walletService.submitWithdrawal(withdrawForm);
      if (res.data.success) {
        setSuccessMsg('Withdrawal request submitted! Amount moved to frozen balance.');
        setShowWithdrawModal(false);
        fetchHistory();
        refreshSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setLoading(false);
    }
  };

  const usdtEquivalent = (rechargeForm.amount / usdtRateINR).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" /> Account Wallet & Balance
          </h1>
          <p className="text-xs text-slate-400">Manage available balance, add funds, or request bank withdrawals.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => {
              setError('');
              setShowRechargeModal(true);
            }}
          >
            Add Funds
          </Button>
          <Button
            variant="secondary"
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
            onClick={() => {
              setError('');
              setShowWithdrawModal(true);
            }}
          >
            Withdraw Funds
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Balance Summary Cards (Available Balance & Frozen Balance only per client directive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-emerald-500 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Balance</p>
          <h2 className="text-3xl font-extrabold text-slate-100">
            ₹{wallet?.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </h2>
          <p className="text-[11px] text-slate-500">Unlocked and available for instant trades & withdrawals.</p>
        </Card>

        <Card className="border-t-4 border-t-amber-500 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frozen Balance</p>
          <h2 className="text-3xl font-extrabold text-slate-100">
            ₹{wallet?.frozenBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </h2>
          <p className="text-[11px] text-slate-500">Held during active trades or pending withdrawal requests.</p>
        </Card>
      </div>

      {/* Recent Add Funds Deposit Requests */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" /> Recent Add-Funds Deposit Requests
        </h3>

        {recharges.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">No add-funds deposit requests found.</p>
        ) : (
          <Table headers={['Request ID', 'Amount (₹)', 'Payment Method', 'Ref / TxHash', 'Status', 'Receipt']}>
            {recharges.map((r) => (
              <tr key={r._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{r.requestId}</td>
                <td className="px-5 py-3 font-bold text-emerald-400">
                  +₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 text-xs text-slate-300">{r.paymentMethod}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.referenceNumber}</td>
                <td className="px-5 py-3">
                  {r.status === 'APPROVED' && <Badge variant="success">APPROVED</Badge>}
                  {r.status === 'PENDING' && <Badge variant="pending">PENDING</Badge>}
                  {r.status === 'REJECTED' && (
                    <div className="space-y-1">
                      <Badge variant="danger">REJECTED</Badge>
                      {r.rejectionReason && <p className="text-[10px] text-rose-400">{r.rejectionReason}</p>}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3">
                  {r.receiptUrl ? (
                    <button
                      onClick={() => setSelectedReceiptUrl(r.receiptUrl!)}
                      className="p-1.5 bg-brand-surface border border-brand-border rounded-lg text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" /> Proof
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Add Funds Modal */}
      {showRechargeModal && (
        <Modal isOpen={true} onClose={() => setShowRechargeModal(false)} title="Add Funds to Wallet">
          <form onSubmit={handleRechargeSubmit} className="space-y-4">
            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

            <Select
              label="Select Payment / Deposit Method"
              value={rechargeForm.paymentMethod}
              onChange={(e) => setRechargeForm({ ...rechargeForm, paymentMethod: e.target.value })}
              options={[
                { label: 'Finance Department (Person-to-Person Telegram Deposit)', value: 'Finance Department (Person-to-Person Telegram)' },
                { label: 'Crypto Deposit (USDT TRC20 / ERC20)', value: 'Crypto Deposit (USDT TRC20)' },
              ]}
            />

            {/* Option 1 Details: Finance Department Telegram */}
            {rechargeForm.paymentMethod.includes('Finance Department') && (
              <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-sky-300 text-sm">
                  <MessageCircle className="w-4 h-4 text-sky-400" /> Telegram Finance Department
                </div>
                <p className="text-slate-300">
                  Contact our Finance Representative directly on Telegram for instant person-to-person deposit. Submit payment reference number below after transfer.
                </p>
                <a
                  href={telegramFinanceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Open Telegram Finance Chat <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Option 2 Details: Crypto Deposit USDT */}
            {rechargeForm.paymentMethod.includes('Crypto') && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-amber-400" /> USDT Crypto Deposit Rate</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 rounded-md text-[11px]">1 USDT = ₹{usdtRateINR.toFixed(2)}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-semibold">Deposit Wallet Address (USDT TRC20):</span>
                  <div className="p-2.5 bg-black/40 border border-amber-500/30 rounded-xl font-mono text-[11px] text-amber-300 flex items-center justify-between gap-2">
                    <span className="truncate">{cryptoDepositAddress}</span>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="p-1 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 text-xs shrink-0 flex items-center gap-1"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 font-medium">
                  Amount in USDT: <span className="font-bold text-emerald-400">~{usdtEquivalent} USDT</span> (calculated at ₹{usdtRateINR}/USDT)
                </div>
              </div>
            )}

            <Input
              label="Deposit Amount (₹)"
              type="number"
              value={rechargeForm.amount}
              onChange={(e) => setRechargeForm({ ...rechargeForm, amount: Number(e.target.value) })}
              required
            />

            <Input
              label="Transaction Reference / TxHash / UTR Number"
              placeholder="e.g. 123456789012 or TxHash..."
              value={rechargeForm.referenceNumber}
              onChange={(e) => setRechargeForm({ ...rechargeForm, referenceNumber: e.target.value })}
              required
            />

            <ImageUploadPicker
              label="Payment Screenshot / Transfer Receipt Photo"
              value={rechargeForm.receiptUrl}
              onChange={(url) => setRechargeForm({ ...rechargeForm, receiptUrl: url })}
              helperText="Upload payment screenshot proof for Admin verification"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowRechargeModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={loading}>
                Submit Deposit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Receipt Image Modal Preview */}
      {selectedReceiptUrl && (
        <Modal isOpen={true} onClose={() => setSelectedReceiptUrl(null)} title="Payment Proof Receipt Screenshot">
          <div className="space-y-4">
            <img src={selectedReceiptUrl} alt="Payment Receipt" className="w-full max-h-96 object-contain rounded-2xl border border-brand-border" />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedReceiptUrl(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <Modal isOpen={true} onClose={() => setShowWithdrawModal(false)} title="Request Bank Withdrawal">
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

            <Input
              label="Withdrawal Amount (₹)"
              type="number"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: Number(e.target.value) })}
              required
            />

            <Input
              label="Account Holder Name"
              value={withdrawForm.accountHolder}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Bank Name"
                value={withdrawForm.bankName}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                required
              />
              <Input
                label="IFSC Code"
                value={withdrawForm.ifscCode}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value })}
                required
              />
            </div>

            <Input
              label="Bank Account Number / UPI ID"
              value={withdrawForm.accountNumber}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowWithdrawModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" isLoading={loading}>
                Submit Withdrawal Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
