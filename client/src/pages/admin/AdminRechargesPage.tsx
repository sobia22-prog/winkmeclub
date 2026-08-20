import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { RechargeRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { ArrowDownRight, CheckCircle2, XCircle, Eye, Edit3 } from 'lucide-react';

export const AdminRechargesPage: React.FC = () => {
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedRecharge, setSelectedRecharge] = useState<RechargeRequest | null>(null);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [overrideAmount, setOverrideAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecharges = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRecharges({ status });
      if (res.data.success) {
        setRecharges(res.data.recharges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();
  }, [status]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecharge) return;
    setActionLoading(true);

    try {
      const res = await adminService.reviewRecharge(selectedRecharge._id, {
        action: reviewAction,
        amount: overrideAmount > 0 ? overrideAmount : selectedRecharge.amount,
        rejectionReason: reason,
      });

      if (res.data.success) {
        setSelectedRecharge(null);
        setReason('');
        fetchRecharges();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Review action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowDownRight className="w-6 h-6 text-emerald-400" /> Recharge / Add-Funds Management
          </h1>
          <p className="text-xs text-slate-400">Review user add-funds requests, edit deposit amounts, inspect payment proof receipts, & approve wallet credits.</p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: 'All Requests', value: 'ALL' },
              { label: 'Pending Requests', value: 'PENDING' },
              { label: 'Approved Requests', value: 'APPROVED' },
              { label: 'Rejected Requests', value: 'REJECTED' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading recharge requests...</Card>
      ) : recharges.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No recharge requests found for filter.</Card>
      ) : (
        <Table headers={['Request ID', 'User', 'Amount', 'Method', 'Reference / TxHash', 'Proof', 'Status', 'Actions']}>
          {recharges.map((r) => (
            <tr key={r._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-mono font-bold text-slate-200">{r.requestId}</td>
              <td className="px-5 py-3 font-semibold text-slate-200">
                {typeof r.userId === 'object' ? r.userId.fullName : 'User'}
              </td>
              <td className="px-5 py-3 font-bold text-emerald-400">
                +₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3 text-xs text-slate-300">{r.paymentMethod}</td>
              <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.referenceNumber}</td>
              <td className="px-5 py-3">
                {r.receiptUrl ? (
                  <button
                    onClick={() => setSelectedReceiptUrl(r.receiptUrl!)}
                    className="p-1.5 bg-brand-surface border border-brand-border rounded-lg text-slate-300 hover:text-white flex items-center gap-1 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> Proof
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">N/A</span>
                )}
              </td>
              <td className="px-5 py-3">
                {r.status === 'APPROVED' && <Badge variant="success">APPROVED</Badge>}
                {r.status === 'PENDING' && <Badge variant="pending">PENDING</Badge>}
                {r.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
              </td>
              <td className="px-5 py-3">
                {r.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedRecharge(r);
                        setOverrideAmount(r.amount);
                        setReviewAction('APPROVE');
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedRecharge(r);
                        setOverrideAmount(r.amount);
                        setReviewAction('REJECT');
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Processed</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Proof Receipt Modal */}
      {selectedReceiptUrl && (
        <Modal isOpen={true} onClose={() => setSelectedReceiptUrl(null)} title="User Payment Receipt Screenshot">
          <div className="space-y-4">
            <img src={selectedReceiptUrl} alt="Payment Receipt" className="w-full max-h-96 object-contain rounded-2xl border border-brand-border" />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedReceiptUrl(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      {selectedRecharge && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecharge(null)}
          title={`Confirm Recharge ${reviewAction} — #${selectedRecharge.requestId}`}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-4 bg-brand-card border border-brand-border rounded-xl space-y-1 text-xs">
              <div>User: <span className="font-bold text-slate-100">{typeof selectedRecharge.userId === 'object' ? selectedRecharge.userId.fullName : 'User'}</span></div>
              <div>Method: <span className="font-bold text-slate-200">{selectedRecharge.paymentMethod}</span></div>
              <div>Reference: <span className="font-mono font-bold text-slate-200">{selectedRecharge.referenceNumber}</span></div>
            </div>

            {reviewAction === 'APPROVE' && (
              <Input
                label="Confirm / Edit Deposit Amount (₹)"
                type="number"
                value={overrideAmount}
                onChange={(e) => setOverrideAmount(Number(e.target.value))}
                helperText="You can edit the deposit amount credited to the user's available balance"
                required
              />
            )}

            {selectedRecharge.receiptUrl && (
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Attached Receipt Screenshot:</span>
                <img src={selectedRecharge.receiptUrl} alt="Receipt" className="h-40 w-full object-contain bg-black/40 rounded-xl border border-brand-border" />
              </div>
            )}

            {reviewAction === 'REJECT' && (
              <Input
                label="Rejection Reason (Optional)"
                placeholder="UTR mismatch / Payment not received"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedRecharge(null)} type="button">
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'APPROVE' ? 'primary' : 'danger'}
                type="submit"
                isLoading={actionLoading}
              >
                Confirm {reviewAction}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
