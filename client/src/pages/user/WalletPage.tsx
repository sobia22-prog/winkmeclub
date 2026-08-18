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
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownRight, History, Shield, CheckCircle2 } from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { wallet, refreshSession } = useAuth();
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Recharge Form
  const [rechargeForm, setRechargeForm] = useState({
    amount: 5000,
    paymentMethod: 'UPI / Bank Transfer',
    referenceNumber: '',
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

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await walletService.submitRecharge(rechargeForm);
      if (res.data.success) {
        setSuccessMsg('Recharge request submitted successfully! Admin will verify reference.');
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

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" /> Account Wallet & Balance
          </h1>
          <p className="text-xs text-slate-400">Manage your available balance, add funds, or request bank withdrawals.</p>
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
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

        <Card className="border-t-4 border-t-brand-wine space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Balance</p>
          <h2 className="text-3xl font-extrabold text-slate-100">
            ₹{wallet?.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </h2>
          <p className="text-[11px] text-slate-500">Combined portfolio value across available and frozen holdings.</p>
        </Card>
      </div>

      {/* Recent Recharge Add-Funds Requests */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ArrowDownRight className="w-5 h-5 text-emerald-400" /> Recent Add-Funds (Recharge) Requests
        </h3>

        {recharges.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">No recharge requests submitted yet.</Card>
        ) : (
          <Table headers={['Request ID', 'Amount', 'Payment Method', 'Reference No', 'Status', 'Date']}>
            {recharges.map((rcg) => (
              <tr key={rcg._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{rcg.requestId}</td>
                <td className="px-5 py-3 font-bold text-emerald-400">
                  +₹{rcg.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 text-slate-300">{rcg.paymentMethod}</td>
                <td className="px-5 py-3 text-slate-400 font-mono">{rcg.referenceNumber}</td>
                <td className="px-5 py-3">
                  {rcg.status === 'APPROVED' && <Badge variant="success">APPROVED</Badge>}
                  {rcg.status === 'PENDING' && <Badge variant="pending">PENDING APPROVAL</Badge>}
                  {rcg.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {new Date(rcg.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Recent Withdrawals Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-rose-400" /> Recent Withdrawal Requests
        </h3>

        {withdrawals.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500">No withdrawal requests submitted yet.</Card>
        ) : (
          <Table headers={['Request ID', 'Amount', 'Bank Name', 'Account Number', 'Status', 'Date']}>
            {withdrawals.map((wtd) => (
              <tr key={wtd._id} className="hover:bg-brand-card/50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-slate-200">{wtd.requestId}</td>
                <td className="px-5 py-3 font-bold text-rose-400">
                  -₹{wtd.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 text-slate-300">{wtd.bankName}</td>
                <td className="px-5 py-3 text-slate-400 font-mono">{wtd.accountNumber}</td>
                <td className="px-5 py-3">
                  {wtd.status === 'COMPLETED' && <Badge variant="success">COMPLETED</Badge>}
                  {wtd.status === 'APPROVED' && <Badge variant="warning">PROCESSING</Badge>}
                  {wtd.status === 'PENDING' && <Badge variant="pending">PENDING</Badge>}
                  {wtd.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {new Date(wtd.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Add Funds Recharge Modal */}
      <Modal isOpen={showRechargeModal} onClose={() => setShowRechargeModal(false)} title="Add Funds to Wallet">
        <form onSubmit={handleRechargeSubmit} className="space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

          <Input
            label="Recharge Amount (₹)"
            type="number"
            value={rechargeForm.amount}
            onChange={(e) => setRechargeForm({ ...rechargeForm, amount: Number(e.target.value) })}
            min={100}
            required
          />

          <Select
            label="Payment Method"
            value={rechargeForm.paymentMethod}
            onChange={(e) => setRechargeForm({ ...rechargeForm, paymentMethod: e.target.value })}
            options={[
              { label: 'UPI / GooglePay / PhonePe', value: 'UPI / Bank Transfer' },
              { label: 'IMPS / NEFT Direct Bank', value: 'IMPS / Direct Bank' },
              { label: 'Crypto Transfer (USDT)', value: 'USDT Crypto' },
            ]}
          />

          <Input
            label="Transaction Reference Number / UTR"
            placeholder="e.g. UPI-98218921092"
            value={rechargeForm.referenceNumber}
            onChange={(e) => setRechargeForm({ ...rechargeForm, referenceNumber: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowRechargeModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              Submit Add Funds Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="Request Bank Withdrawal">
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

          <Input
            label="Withdrawal Amount (₹)"
            type="number"
            value={withdrawForm.amount}
            onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: Number(e.target.value) })}
            min={500}
            required
          />

          <Input
            label="Bank Name"
            value={withdrawForm.bankName}
            onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
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
              label="Account Number"
              value={withdrawForm.accountNumber}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
              required
            />
            <Input
              label="IFSC Code"
              value={withdrawForm.ifscCode}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value })}
            />
          </div>

          <p className="text-[11px] text-amber-400">
            Note: On submission, ₹{withdrawForm.amount || 0} will be temporarily moved into your Frozen Balance until admin completion.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowWithdrawModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              Submit Withdrawal Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
