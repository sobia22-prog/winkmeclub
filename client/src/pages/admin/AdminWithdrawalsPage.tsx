import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { WithdrawalRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowUpRight, CheckCircle2, XCircle, Send, QrCode, Eye, Clock } from 'lucide-react';

export const AdminWithdrawalsPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const currencySymbol = settings.currencySymbol || '₹';

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [selectedQrUrl, setSelectedQrUrl] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'COMPLETE' | 'REJECT'>('COMPLETE');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await adminService.getWithdrawals({ status: 'ALL' });
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
  }, []);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await adminService.reviewWithdrawal(selectedWithdrawal._id, {
        action: actionType,
        rejectionReason: reason,
      });

      if (res.data.success) {
        setMessage(`Withdrawal #${selectedWithdrawal.requestId} ${actionType === 'COMPLETE' ? 'Accepted & Completed' : 'Rejected'} successfully.`);
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

  const pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'PENDING');
  const previousWithdrawals = withdrawals.filter((w: any) => w.status !== 'PENDING');

  return (
    <div className="space-y-6 w-full">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-pink-600" /> Withdraw Requests
          </h1>
          <p className="text-xs text-slate-500">Review payout details and accept or reject user withdraw requests.</p>
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
          <div className="text-2xl font-black text-pink-600 mt-1">{pendingWithdrawals.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">PREVIOUS REQUESTS</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{previousWithdrawals.length}</div>
        </div>
      </div>

      {/* SECTION 1: Pending Withdraw Requests */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Pending Withdraw Requests</h2>
          <p className="text-xs text-slate-500">Requests waiting for accept or reject appear here first.</p>
        </div>

        <div className="w-full overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
          {loading ? (
            <Card className="p-8 text-center text-xs text-slate-500">Loading pending requests...</Card>
          ) : pendingWithdrawals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No pending withdraw requests.</div>
          ) : (
            <Table headers={['User', 'Method', 'Amount', 'Status', 'Requested', 'Actions']}>
              {pendingWithdrawals.map((w: any) => {
                const userObj = typeof w.userId === 'object' ? w.userId : null;
                const staffObj = userObj?.assignedStaff && typeof userObj.assignedStaff === 'object' ? userObj.assignedStaff : null;

                return (
                  <tr key={w._id} className="hover:bg-slate-50 transition-colors">
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
                      <div className="font-bold text-slate-900">{w.paymentMethod || 'Bank Account'}</div>
                      {w.upiId && <div className="font-mono text-pink-600 font-bold">UPI: {w.upiId}</div>}
                      {w.accountNumber && (
                        <div className="font-mono text-slate-600 text-[11px]">
                          {w.bankName} • A/C: {w.accountNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-bold text-pink-600 text-xs">
                      {currencySymbol}{w.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="pending">PENDING</Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 font-medium">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedWithdrawal(w)}
                          className="whitespace-nowrap"
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setSelectedWithdrawal(w);
                            setActionType('COMPLETE');
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
                            setSelectedWithdrawal(w);
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

      {/* SECTION 2: View Previous Withdraw Requests */}
      <div className="space-y-3 pt-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">View Previous Withdraw Requests</h2>
          <p className="text-xs text-slate-500">Accepted and rejected requests are listed below.</p>
        </div>

        <div className="w-full overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
          {loading ? (
            <Card className="p-8 text-center text-xs text-slate-500">Loading previous requests...</Card>
          ) : previousWithdrawals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No previous withdraw requests found.</div>
          ) : (
            <Table headers={['User', 'Method', 'Amount', 'Status', 'Requested', 'Actions']}>
              {previousWithdrawals.map((w: any) => {
                const userObj = typeof w.userId === 'object' ? w.userId : null;
                const staffObj = userObj?.assignedStaff && typeof userObj.assignedStaff === 'object' ? userObj.assignedStaff : null;
                const isAccepted = w.status === 'COMPLETED' || w.status === 'APPROVED';

                return (
                  <tr key={w._id} className="hover:bg-slate-50 transition-colors">
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
                      <div className="font-bold text-slate-900">{w.paymentMethod || 'Bank Account'}</div>
                      {w.upiId && <div className="font-mono text-pink-600 font-bold">UPI: {w.upiId}</div>}
                      {w.accountNumber && (
                        <div className="font-mono text-slate-600 text-[11px]">
                          {w.bankName} • A/C: {w.accountNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900 text-xs">
                      {currencySymbol}{w.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3">
                      {isAccepted ? (
                        <Badge variant="success">Accepted</Badge>
                      ) : (
                        <Badge variant="danger">Rejected</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 font-medium">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedWithdrawal(w)}
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

      {/* QR Code Preview Modal */}
      {selectedQrUrl && (
        <Modal isOpen={true} onClose={() => setSelectedQrUrl(null)} title="User Payout QR Code Photo">
          <div className="space-y-4">
            <img src={selectedQrUrl} alt="User QR Code" className="w-full max-h-96 object-contain rounded-2xl border border-slate-200 bg-slate-50" />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedQrUrl(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Action / View Details Modal */}
      {selectedWithdrawal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedWithdrawal(null)}
          title={`Withdrawal Request Details — #${selectedWithdrawal.requestId}`}
        >
          <form onSubmit={handleActionSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-2 text-xs text-slate-700">
              <div>User: <span className="font-bold text-slate-900">{typeof selectedWithdrawal.userId === 'object' ? selectedWithdrawal.userId.fullName : 'User'} ({typeof selectedWithdrawal.userId === 'object' ? selectedWithdrawal.userId.email : ''})</span></div>
              {isAdmin && (
                <div>Assigned Staff: <span className="font-bold text-pink-700">{typeof selectedWithdrawal.userId === 'object' && selectedWithdrawal.userId.assignedStaff ? `${selectedWithdrawal.userId.assignedStaff.invitationCode || ''} (${selectedWithdrawal.userId.assignedStaff.fullName})` : 'Unassigned'}</span></div>
              )}
              <div>Amount: <span className="font-bold text-rose-600 font-mono text-sm">{currencySymbol}{selectedWithdrawal.amount.toFixed(2)}</span></div>
              <div>Payout Method: <span className="font-bold text-pink-600">{selectedWithdrawal.paymentMethod || 'Bank Account'}</span></div>
              <div>Holder Name: <span className="font-bold text-slate-900">{selectedWithdrawal.accountHolder}</span></div>
              {selectedWithdrawal.upiId && <div>UPI ID: <span className="font-mono text-pink-600 font-bold">{selectedWithdrawal.upiId}</span></div>}
              {selectedWithdrawal.accountNumber && <div>Bank Account: <span className="font-mono text-slate-800">{selectedWithdrawal.bankName} • A/C: {selectedWithdrawal.accountNumber} ({selectedWithdrawal.ifscCode})</span></div>}
              <div>Status: <span className="font-bold text-slate-900">{selectedWithdrawal.status}</span></div>
            </div>

            {selectedWithdrawal.qrCodeUrl && (
              <div className="space-y-1">
                <span className="text-xs text-slate-600 font-semibold block">Uploaded QR Code Photo:</span>
                <img src={selectedWithdrawal.qrCodeUrl} alt="QR Code" className="h-44 w-full object-contain bg-slate-50 rounded-2xl border border-slate-200" />
              </div>
            )}

            {selectedWithdrawal.status === 'PENDING' && actionType === 'REJECT' && (
              <Input
                label="Rejection Reason (Optional — Requested amount will be refunded to user's Available Balance)"
                placeholder="Invalid UPI ID / QR code unreadable / Account mismatch"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedWithdrawal(null)} type="button">
                Close
              </Button>
              {selectedWithdrawal.status === 'PENDING' && (
                <Button
                  variant={actionType === 'COMPLETE' ? 'primary' : 'danger'}
                  type="submit"
                  isLoading={actionLoading}
                >
                  Confirm {actionType === 'COMPLETE' ? 'Accept' : 'Reject'}
                </Button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
