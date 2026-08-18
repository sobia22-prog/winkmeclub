import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Verification } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ShieldCheck, CheckCircle2, XCircle, Eye } from 'lucide-react';

export const AdminVerificationsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
        setSelectedVerification(null);
        setReason('');
        fetchVerifications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Review failed');
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
          <p className="text-xs text-slate-400">Inspect submitted government IDs, verify selfies, & approve Gold VIP status.</p>
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
        <Card className="p-8 text-center text-xs text-slate-500">Loading verification requests...</Card>
      ) : verifications.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">No verification submissions found for filter.</Card>
      ) : (
        <Table headers={['User', 'Full Name', 'ID Type', 'ID Number', 'Status', 'Submitted At', 'Actions']}>
          {verifications.map((v) => (
            <tr key={v._id} className="hover:bg-brand-card/50 transition-colors">
              <td className="px-5 py-3 font-semibold text-slate-200">
                {typeof v.userId === 'object' ? v.userId.fullName : 'User'}
              </td>
              <td className="px-5 py-3 text-slate-300">{v.fullName}</td>
              <td className="px-5 py-3 text-slate-400">{v.idType}</td>
              <td className="px-5 py-3 font-mono text-slate-300">{v.idNumber}</td>
              <td className="px-5 py-3">
                {v.status === 'APPROVED' && <Badge variant="verified">APPROVED</Badge>}
                {v.status === 'PENDING' && <Badge variant="pending">PENDING</Badge>}
                {v.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
              </td>
              <td className="px-5 py-3 text-xs text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSelectedVerification(v);
                    setReviewAction('APPROVE');
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
                  className="w-full h-44 rounded-xl object-cover border border-brand-border"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Selfie Photo</span>
                <img
                  src={selectedVerification.selfieUrl}
                  alt="Selfie"
                  className="w-full h-44 rounded-xl object-cover border border-brand-border"
                />
              </div>
            </div>

            <div className="p-3 bg-brand-card border border-brand-border rounded-xl space-y-1 text-xs">
              <div>Name: <span className="font-bold text-slate-100">{selectedVerification.fullName}</span></div>
              <div>ID Type: <span className="font-semibold text-slate-300">{selectedVerification.idType}</span> ({selectedVerification.idNumber})</div>
            </div>

            {selectedVerification.status === 'PENDING' && (
              <div className="space-y-3 pt-2">
                <Select
                  label="Decision Action"
                  value={reviewAction}
                  onChange={(e: any) => setReviewAction(e.target.value)}
                  options={[
                    { label: 'Approve & Activate VIP Badge', value: 'APPROVE' },
                    { label: 'Reject Submission', value: 'REJECT' },
                  ]}
                />

                {reviewAction === 'REJECT' && (
                  <Input
                    label="Rejection Reason"
                    placeholder="Document image blurry or ID expired"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedVerification(null)} type="button">
                Close
              </Button>
              {selectedVerification.status === 'PENDING' && (
                <Button
                  variant={reviewAction === 'APPROVE' ? 'gold' : 'danger'}
                  type="submit"
                  isLoading={actionLoading}
                >
                  Submit Decision
                </Button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
