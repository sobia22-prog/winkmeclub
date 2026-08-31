import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { RechargeRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowDownRight, CheckCircle2, XCircle, Send, Eye } from 'lucide-react';

export const AdminRechargesPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const currencySymbol = settings.currencySymbol || '₹';

  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRecharge, setSelectedRecharge] = useState<any | null>(null);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [overrideAmount, setOverrideAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchRecharges = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRecharges({ status: 'ALL' });
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
  }, []);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecharge) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await adminService.reviewRecharge(selectedRecharge._id, {
        action: actionType,
        amount: overrideAmount > 0 ? overrideAmount : selectedRecharge.amount,
        rejectionReason: reason,
      });

      if (res.data.success) {
        setMessage(`Recharge #${selectedRecharge.requestId} ${actionType === 'APPROVE' ? 'Accepted & Credited' : 'Rejected'} successfully.`);
        setSelectedRecharge(null);
        setReason('');
        fetchRecharges();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Recharge action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRecharges = recharges.filter((r: any) => r.status === 'PENDING');
  const previousRecharges = recharges.filter((r: any) => r.status !== 'PENDING');

  return (
    <div className="space-y-6 w-full">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ArrowDownRight className="w-6 h-6 text-pink-600" /> Recharge Requests
          </h1>
          <p className="text-xs text-slate-500">Review deposit details and accept or reject user recharge requests.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">PENDING REQUESTS</span>
          <div className="text-2xl font-black text-pink-600 mt-1">{pendingRecharges.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">PREVIOUS REQUESTS</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{previousRecharges.length}</div>
        </div>
      </div>

      {/* SECTION 1: Pending Recharge Requests */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Pending Recharge Requests</h2>
          <p className="text-xs text-slate-500">Requests waiting for accept or reject appear here first.</p>
        </div>

        <div className="w-full overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
          {loading ? (
            <Card className="p-8 text-center text-xs text-slate-500">Loading pending requests...</Card>
          ) : pendingRecharges.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No pending recharge requests.</div>
          ) : (
            <Table headers={['User', 'Method', 'Amount', 'Status', 'Requested', 'Actions']}>
              {pendingRecharges.map((r: any) => {
                const userObj = typeof r.userId === 'object' ? r.userId : null;
                const staffObj = userObj?.assignedStaff && typeof userObj.assignedStaff === 'object' ? userObj.assignedStaff : null;

                return (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{userObj?.fullName || 'User'}</div>
                        <div className="text-[11px] text-slate-500">{userObj?.email}</div>
                        {isAdmin && (
                          <div className="mt-1">
                            {staffObj ? (
                              <span className="px-2 py-0.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 text-[10px] font-mono font-bold">
                                Staff: {staffObj.invitationCode || staffObj.fullName} ({staffObj.fullName})
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">Unassigned</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-700 font-medium">
                      <div className="font-bold text-slate-900">{r.paymentMethod || 'UPI / Bank Deposit'}</div>
                      {r.referenceNumber && <div className="font-mono text-pink-600 font-bold">Ref: {r.referenceNumber}</div>}
                    </td>
                    <td className="px-5 py-3 font-bold text-emerald-600 text-xs">
                      +{currencySymbol}{r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="pending">PENDING</Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 font-medium">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedRecharge(r)}
                          className="whitespace-nowrap"
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setSelectedRecharge(r);
                            setOverrideAmount(r.amount);
                            setActionType('APPROVE');
                          }}
                          className="whitespace-nowrap"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setSelectedRecharge(r);
                            setOverrideAmount(r.amount);
                            setActionType('REJECT');
                          }}
                          className="whitespace-nowrap"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </div>
      </div>

      {/* SECTION 2: View Previous Recharge Requests */}
      <div className="space-y-3 pt-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">View Previous Recharge Requests</h2>
          <p className="text-xs text-slate-500">Accepted and rejected requests are listed below.</p>
        </div>

        <div className="w-full overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
          {loading ? (
            <Card className="p-8 text-center text-xs text-slate-500">Loading previous requests...</Card>
          ) : previousRecharges.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No previous recharge requests found.</div>
          ) : (
            <Table headers={['User', 'Method', 'Amount', 'Status', 'Requested', 'Actions']}>
              {previousRecharges.map((r: any) => {
                const userObj = typeof r.userId === 'object' ? r.userId : null;
                const staffObj = userObj?.assignedStaff && typeof userObj.assignedStaff === 'object' ? userObj.assignedStaff : null;
                const isAccepted = r.status === 'APPROVED' || r.status === 'COMPLETED';

                return (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{userObj?.fullName || 'User'}</div>
                        <div className="text-[11px] text-slate-500">{userObj?.email}</div>
                        {isAdmin && (
                          <div className="mt-1">
                            {staffObj ? (
                              <span className="px-2 py-0.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 text-[10px] font-mono font-bold">
                                Staff: {staffObj.invitationCode || staffObj.fullName} ({staffObj.fullName})
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">Unassigned</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-700 font-medium">
                      <div className="font-bold text-slate-900">{r.paymentMethod || 'UPI / Bank Deposit'}</div>
                      {r.referenceNumber && <div className="font-mono text-pink-600 font-bold">Ref: {r.referenceNumber}</div>}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900 text-xs">
                      +{currencySymbol}{r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3">
                      {isAccepted ? (
                        <Badge variant="success">Accepted</Badge>
                      ) : (
                        <Badge variant="danger">Rejected</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 font-medium">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedRecharge(r)}
                        className="whitespace-nowrap"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </div>
      </div>

      {/* Payment Proof Receipt Modal */}
      {selectedReceiptUrl && (
        <Modal isOpen={true} onClose={() => setSelectedReceiptUrl(null)} title="User Payment Receipt Screenshot">
          <div className="space-y-4">
            <img src={selectedReceiptUrl} alt="Payment Receipt" className="w-full max-h-96 object-contain rounded-2xl border border-slate-200 bg-slate-50" />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedReceiptUrl(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Action / View Details Modal */}
      {selectedRecharge && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecharge(null)}
          title={`Recharge Request Details — #${selectedRecharge.requestId}`}
        >
          <form onSubmit={handleActionSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-2 text-xs text-slate-700">
              <div>User: <span className="font-bold text-slate-900">{typeof selectedRecharge.userId === 'object' ? selectedRecharge.userId.fullName : 'User'} ({typeof selectedRecharge.userId === 'object' ? selectedRecharge.userId.email : ''})</span></div>
              {isAdmin && (
                <div>Assigned Staff: <span className="font-bold text-pink-700">{typeof selectedRecharge.userId === 'object' && selectedRecharge.userId.assignedStaff ? `${selectedRecharge.userId.assignedStaff.invitationCode || ''} (${selectedRecharge.userId.assignedStaff.fullName})` : 'Unassigned'}</span></div>
              )}
              <div>Requested Amount: <span className="font-bold text-emerald-600 font-mono text-sm">+{currencySymbol}{selectedRecharge.amount.toFixed(2)}</span></div>
              <div>Payment Method: <span className="font-bold text-pink-600">{selectedRecharge.paymentMethod || 'UPI / Bank Deposit'}</span></div>
              <div>Reference / TxHash: <span className="font-mono text-slate-900 font-bold">{selectedRecharge.referenceNumber || 'N/A'}</span></div>
              <div>Status: <span className="font-bold text-slate-900">{selectedRecharge.status}</span></div>
            </div>

            {selectedRecharge.receiptUrl && (
              <div className="space-y-1">
                <span className="text-xs text-slate-600 font-semibold block">Uploaded Payment Receipt Proof:</span>
                <img src={selectedRecharge.receiptUrl} alt="Payment Receipt" className="h-44 w-full object-contain bg-slate-50 rounded-2xl border border-slate-200" />
              </div>
            )}

            {selectedRecharge.status === 'PENDING' && actionType === 'APPROVE' && (
              <Input
                label={`Confirm / Edit Deposit Amount (${currencySymbol})`}
                type="number"
                value={overrideAmount}
                onChange={(e) => setOverrideAmount(Number(e.target.value))}
                helperText="You can edit the deposit amount credited to the user's available balance"
                required
              />
            )}

            {selectedRecharge.status === 'PENDING' && actionType === 'REJECT' && (
              <Input
                label="Rejection Reason (Optional)"
                placeholder="UTR mismatch / Payment receipt unreadable"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedRecharge(null)} type="button">
                Close
              </Button>
              {selectedRecharge.status === 'PENDING' && (
                <Button
                  variant={actionType === 'APPROVE' ? 'primary' : 'danger'}
                  type="submit"
                  isLoading={actionLoading}
                >
                  Confirm {actionType === 'APPROVE' ? 'Accept' : 'Reject'}
                </Button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

