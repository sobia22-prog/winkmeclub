import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Verification } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { ShieldCheck, CheckCircle2, XCircle, Eye } from 'lucide-react';

export const AdminVerificationsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'PENDING'>('APPROVE');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await adminService.getVerifications({ status });
      if (res.data.success) {
        setVerifications(res.data.verifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [status]);

  const handleInlineStatusChange = async (verificationId: string, newStatus: 'APPROVE' | 'REJECT' | 'PENDING') => {
    try {
      const res = await adminService.reviewVerification(verificationId, {
        action: newStatus,
        reason: newStatus === 'REJECT' ? 'Admin status adjustment' : '',
      });
      if (res.data.success) {
        setMessage(`Verification status updated to ${newStatus}`);
        fetchVerifications();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification action failed.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerification) return;
    setActionLoading(true);

    try {
      const res = await adminService.reviewVerification(selectedVerification._id, {
        action: reviewAction,
        reason,
      });

      if (res.data.success) {
        setMessage(`Verification request updated to ${reviewAction}`);
        setSelectedVerification(null);
        setReason('');
        fetchVerifications();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Review failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" /> VIP Identity Verification Requests
          </h1>
          <p className="text-xs text-slate-400">Inspect submitted government IDs, verify selfies, & manage Gold VIP status controls.</p>
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

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500">Loading verification requests...</Card>
      ) : verifications.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No verification submissions found for filter.</Card>
      ) : (
        <Table headers={['User', 'Full Name', 'ID Type', 'ID Number', 'Interactive Status Control', 'Submitted At', 'Actions']}>
          {verifications.map((v) => (
            <tr key={v._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-semibold text-slate-200">
                {typeof v.userId === 'object' ? v.userId.fullName : 'User'}
              </td>
              <td className="px-5 py-3 text-slate-300">{v.fullName}</td>
              <td className="px-5 py-3 text-slate-400">{v.idType}</td>
              <td className="px-5 py-3 font-mono text-slate-300">{v.idNumber}</td>
              <td className="px-5 py-3">
                {/* Interactive Status Selector inside Table */}
                <select
                  value={v.status}
                  onChange={(e) => {
                    const val = e.target.value;
                    let act: 'APPROVE' | 'REJECT' | 'PENDING' = 'PENDING';
                    if (val === 'APPROVED') act = 'APPROVE';
                    if (val === 'REJECTED') act = 'REJECT';
                    handleInlineStatusChange(v._id, act);
                  }}
                  className={`text-xs font-bold rounded-xl px-3 py-1.5 border transition-all cursor-pointer focus:outline-none ${
                    v.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : v.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  <option value="APPROVED" className="bg-brand-surface text-emerald-400 font-bold">✓ APPROVED</option>
                  <option value="PENDING" className="bg-brand-surface text-amber-400 font-bold">⌛ PENDING</option>
                  <option value="REJECTED" className="bg-brand-surface text-rose-400 font-bold">✕ REJECTED</option>
                </select>
              </td>
              <td className="px-5 py-3 text-xs text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSelectedVerification(v);
                    setReviewAction(v.status === 'APPROVED' ? 'APPROVE' : v.status === 'REJECTED' ? 'REJECT' : 'PENDING');
                  }}
                >
                  Inspect & Review
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Inspect & Review Modal */}
      {selectedVerification && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedVerification(null)}
          title={`Inspect Identity Submission — ${selectedVerification.fullName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Government ID Document</span>
                <img
                  src={selectedVerification.idDocumentUrl}
                  alt="ID Document"
                  className="w-full h-44 object-cover rounded-xl border border-brand-border shadow-md"
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Verification Selfie Photo</span>
                <img
                  src={selectedVerification.selfieUrl}
                  alt="Selfie"
                  className="w-full h-44 object-cover rounded-xl border border-brand-border shadow-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">ID Type</span>
                <span className="font-semibold text-slate-200">{selectedVerification.idType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">ID Number</span>
                <span className="font-mono font-semibold text-slate-200">{selectedVerification.idNumber}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-brand-border">
              <label className="block text-xs font-semibold text-slate-300">Admin Action / Status Change</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction('APPROVE')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'bg-brand-surface border-brand-border text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Enable VIP
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('PENDING')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    reviewAction === 'PENDING'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-brand-surface border-brand-border text-slate-400'
                  }`}
                >
                  ⌛ Set Pending
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('REJECT')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    reviewAction === 'REJECT'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-md shadow-rose-500/10'
                      : 'bg-brand-surface border-brand-border text-slate-400'
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Reject Request
                </button>
              </div>
            </div>

            {reviewAction === 'REJECT' && (
              <Input
                label="Rejection Reason"
                placeholder="Document unreadable..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <Button variant="secondary" onClick={() => setSelectedVerification(null)} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={actionLoading}>
                Confirm Status Update
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
