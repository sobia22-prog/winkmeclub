import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { User } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  Users,
  PlusCircle,
  Edit,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldAlert,
  UserCheck,
  Eye,
} from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    status: 'ACTIVE',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchStaff = async () => {
    try {
      const res = await adminService.getStaffMembers();
      if (res.data.success) setStaffList(res.data.staffMembers);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch staff members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (staff: any) => {
    setEditingStaff(staff);
    setForm({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone || '',
      password: '',
      status: staff.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      if (editingStaff) {
        await adminService.updateStaffMember(editingStaff._id || editingStaff.id, form);
        setMessage(`Staff member "${form.fullName}" updated successfully!`);
      } else {
        const res = await adminService.createStaffMember(form);
        setMessage(`Staff member "${form.fullName}" created! Invitation Code: ${res.data.staff.invitationCode}`);
      }
      setShowModal(false);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Staff Member',
      message: `Are you sure you want to delete staff account for "${name}"?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.deleteStaffMember(id);
          setMessage(`Staff member "${name}" deleted.`);
          fetchStaff();
        } catch (err: any) {
          setError('Failed to delete staff member.');
        }
      },
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-600" /> Staff & Team Management
          </h1>
          <p className="text-xs text-slate-500">
            Create staff accounts, generate unique client invitation codes (`STxxxx`), and monitor team performance.
          </p>
        </div>

        <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add New Staff Member
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" /> {error}
          </div>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Staff Table */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <p className="text-center text-xs text-slate-500 py-10">Loading staff members...</p>
        ) : staffList.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10">No staff members created yet. Click above to add staff.</p>
        ) : (
          <Table headers={['Staff Username', 'Unique Invitation Code', 'Assigned Clients', 'Status', 'Actions']}>
            {staffList.map((s) => (
              <tr key={s._id || s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {s.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{s.fullName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 rounded-xl font-mono text-xs font-bold text-pink-700">
                    <Key className="w-3.5 h-3.5" />
                    <span>{s.invitationCode || 'N/A'}</span>
                    {s.invitationCode && (
                      <button
                        onClick={() => copyToClipboard(s.invitationCode)}
                        className="p-1 hover:text-slate-900 transition-colors"
                        title="Copy Invitation Code"
                      >
                        {copiedCode === s.invitationCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-pink-600" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-xs font-extrabold text-slate-800">
                  <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                    {s.clientCount ?? 0} Clients
                  </span>
                </td>
                <td className="px-5 py-3">
                  {s.status === 'ACTIVE' ? <Badge variant="verified">ACTIVE STAFF</Badge> : <Badge variant="danger">SUSPENDED</Badge>}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/staff/${s._id || s.id}`}
                      className="p-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-600 hover:bg-pink-100 transition-colors"
                      title="View Staff Profile & Operations Summary"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-pink-300 transition-colors shadow-sm"
                      title="Edit Staff Member"
                    >
                      <Edit className="w-3.5 h-3.5 text-pink-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id || s.id, s.fullName)}
                      className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Delete Staff Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        confirmText="Delete Staff Account"
      />

      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(false)}
          title={editingStaff ? 'Edit Staff Member Profile' : 'Add New Staff Member Account'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff Username"
              placeholder="e.g. moon"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />

            <Input
              label={editingStaff ? 'New Password (Leave blank to keep unchanged)' : 'Login Password'}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingStaff}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={actionLoading}>
                {editingStaff ? 'Update Staff Member' : 'Create Staff Member'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
