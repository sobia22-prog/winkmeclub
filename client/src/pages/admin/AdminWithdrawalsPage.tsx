import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { WithdrawalRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { ArrowUpRight, CheckCircle2, XCircle, Send, QrCode, Eye } from 'lucide-react';

export const AdminWithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [selectedQrUrl, setSelectedQrUrl] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'COMPLETE' | 'REJECT'>('COMPLETE');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await adminService.getWithdrawals({ status });
      if (res.data.success) {
        setWithdrawals(res.data.withdrawals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [status]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;
    setActionLoading(true);

    try {
      const res = await adminService.reviewWithdrawal(selectedWithdrawal._id, {
        action: actionType,
        rejectionReason: reason,
      });

      if (res.data.success) {
        setSelectedWithdrawal(null);
        setReason('');
        fetchWithdrawals();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-rose-400" /> Withdrawal Request Management
          </h1>
          <p className="text-xs text-slate-400">Review pending UPI, QR Code, or Bank Account payouts, and approve or reject requests.</p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: 'All Requests', value: 'ALL' },
              { label: 'Pending Requests', value: 'PENDING' },
              { label: 'Approved Requests', value: 'APPROVED' },
              { label: 'Completed Requests', value: 'COMPLETED' },
              { label: 'Rejected Requests', value: 'REJECTED' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading withdrawal requests...</Card>
      ) : withdrawals.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No withdrawal requests found for filter.</Card>
      ) : (
        <Table headers={['Request ID', 'User', 'Amount', 'Payout Method & Details', 'Holder Name', 'Status', 'Actions']}>
          {withdrawals.map((w: any) => (
            <tr key={w._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-mono font-bold text-slate-200">{w.requestId}</td>
              <td className="px-5 py-3 font-semibold text-slate-200">
                {typeof w.userId === 'object' ? w.userId.fullName : 'User'}
              </td>
              <td className="px-5 py-3 font-bold text-rose-400">
                -₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3 text-xs text-slate-300">
                <div className="font-bold text-slate-100">{w.paymentMethod || 'Bank Account'}</div>
                {w.upiId && <div className="font-mono text-amber-400">UPI: {w.upiId}</div>}
                {w.accountNumber && (
                  <div className="font-mono text-slate-400">
                    {w.bankName} • A/C: {w.accountNumber} {w.ifscCode && `(${w.ifscCode})`}
                  </div>
                )}
                {w.qrCodeUrl && (
                  <button
                    onClick={() => setSelectedQrUrl(w.qrCodeUrl)}
                    className="p-1 bg-sky-500/10 border border-sky-500/30 rounded text-[11px] text-sky-400 hover:bg-sky-500/20 flex items-center gap-1 mt-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> View QR Code Photo
                  </button>
                )}
              </td>
              <td className="px-5 py-3 text-xs font-semibold text-slate-200">{w.accountHolder}</td>
              <td className="px-5 py-3">
                {w.status === 'COMPLETED' && <Badge variant="success">COMPLETED</Badge>}
                {w.status === 'APPROVED' && <Badge variant="warning">APPROVED</Badge>}
                {w.status === 'PENDING' && <Badge variant="pending">PENDING</Badge>}
                {w.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
              </td>
              <td className="px-5 py-3">
                {w.status !== 'COMPLETED' && w.status !== 'REJECTED' ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedWithdrawal(w);
                        setActionType('COMPLETE');
                      }}
                    >
                      Complete Transfer
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedWithdrawal(w);
                        setActionType('REJECT');
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Finalized</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* QR Code Preview Modal */}
      {selectedQrUrl && (
        <Modal isOpen={true} onClose={() => setSelectedQrUrl(null)} title="User Payout QR Code Photo">
          <div className="space-y-4">
            <img src={selectedQrUrl} alt="User QR Code" className="w-full max-h-96 object-contain rounded-2xl border border-brand-border" />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedQrUrl(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Action Modal */}
      {selectedWithdrawal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedWithdrawal(null)}
          title={`Confirm Withdrawal ${actionType} — #${selectedWithdrawal.requestId}`}
        >
          <form onSubmit={handleActionSubmit} className="space-y-4">
            <div className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-1 text-xs">
              <div>User: <span className="font-bold text-slate-100">{typeof selectedWithdrawal.userId === 'object' ? selectedWithdrawal.userId.fullName : 'User'}</span></div>
              <div>Amount: <span className="font-bold text-rose-400">₹{selectedWithdrawal.amount.toFixed(2)}</span></div>
              <div>Payout Method: <span className="font-bold text-amber-400">{selectedWithdrawal.paymentMethod || 'Bank Account'}</span></div>
              <div>Holder Name: <span className="font-bold text-slate-200">{selectedWithdrawal.accountHolder}</span></div>
              {selectedWithdrawal.upiId && <div>UPI ID: <span className="font-mono text-amber-400">{selectedWithdrawal.upiId}</span></div>}
              {selectedWithdrawal.accountNumber && <div>Bank Account: <span className="font-mono text-slate-300">{selectedWithdrawal.bankName} • {selectedWithdrawal.accountNumber} ({selectedWithdrawal.ifscCode})</span></div>}
            </div>

            {selectedWithdrawal.qrCodeUrl && (
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Uploaded QR Code Photo:</span>
                <img src={selectedWithdrawal.qrCodeUrl} alt="QR Code" className="h-40 w-full object-contain bg-black/40 rounded-xl border border-brand-border" />
              </div>
            )}

            {actionType === 'REJECT' && (
              <Input
                label="Rejection Reason (Requested amount will be refunded to user's Available Balance)"
                placeholder="Invalid UPI ID / QR code unreadable / Account mismatch"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedWithdrawal(null)} type="button">
                Cancel
              </Button>
              <Button
                variant={actionType === 'COMPLETE' ? 'primary' : 'danger'}
                type="submit"
                isLoading={actionLoading}
              >
                Confirm {actionType}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
