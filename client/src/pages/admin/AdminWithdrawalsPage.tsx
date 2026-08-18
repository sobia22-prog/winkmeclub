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
import { ArrowUpRight, CheckCircle2, XCircle, Send } from 'lucide-react';

export const AdminWithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'COMPLETE' | 'REJECT'>('COMPLETE');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      alert(err.response?.data?.message || 'Withdrawal action failed');
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
          <p className="text-xs text-slate-400">Review pending bank withdrawals, approve payouts, or mark bank transfers complete.</p>
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
        <Table headers={['Request ID', 'User', 'Amount', 'Bank', 'Account Number', 'Status', 'Actions']}>
          {withdrawals.map((w) => (
            <tr key={w._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-mono font-bold text-slate-200">{w.requestId}</td>
              <td className="px-5 py-3 font-semibold text-slate-200">
                {typeof w.userId === 'object' ? w.userId.fullName : 'User'}
              </td>
              <td className="px-5 py-3 font-bold text-rose-400">
                -₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3 text-slate-300">{w.bankName}</td>
              <td className="px-5 py-3 font-mono text-slate-400">{w.accountNumber}</td>
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
                      Complete Bank Transfer
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

      {/* Action Modal */}
      {selectedWithdrawal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedWithdrawal(null)}
          title={`Confirm Withdrawal ${actionType} — #${selectedWithdrawal.requestId}`}
        >
          <form onSubmit={handleActionSubmit} className="space-y-4">
            <div className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-1">
              <div className="text-xs text-slate-400">User: <span className="font-bold text-slate-100">{typeof selectedWithdrawal.userId === 'object' ? selectedWithdrawal.userId.fullName : 'User'}</span></div>
              <div className="text-xs text-slate-400">Withdrawal Amount: <span className="font-bold text-rose-400">₹{selectedWithdrawal.amount.toFixed(2)}</span></div>
              <div className="text-xs text-slate-400">Bank Details: <span className="font-bold text-slate-200">{selectedWithdrawal.bankName} ({selectedWithdrawal.accountNumber})</span></div>
            </div>

            {actionType === 'REJECT' && (
              <Input
                label="Rejection Reason (Funds will return to user's Available Balance)"
                placeholder="Bank account mismatch / Invalid IFSC"
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
