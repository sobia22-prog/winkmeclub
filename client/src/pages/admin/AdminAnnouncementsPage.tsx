import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { announcementService } from '../../services/announcement.service';
import { Announcement } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { Megaphone, PlusCircle, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
  });

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

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAnnouncements();
      if (res.data.success) setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminService.createAnnouncement(form);
      if (res.data.success) {
        setMessage('Platform announcement published successfully!');
        setShowModal(false);
        setForm({
          title: '',
          shortDescription: '',
          content: '',
          image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
          status: 'PUBLISHED',
        });
        fetchAnnouncements();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Announcement',
      message: `Are you sure you want to delete the announcement "${title}"?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await adminService.deleteAnnouncement(id);
          setMessage(`Announcement "${title}" deleted.`);
          fetchAnnouncements();
        } catch (err) {
          setError('Failed to delete announcement.');
        }
      },
    });
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-400" /> Platform Announcements
          </h1>
          <p className="text-xs text-slate-400">Broadcast news, popups, and updates to all registered users.</p>
        </div>

        <Button variant="gold" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          Create Announcement
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" /> {error}
          </div>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((a) => (
          <Card key={a._id} className="p-5 space-y-3 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {a.status}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-2">{a.title}</h3>
              </div>
              <button
                onClick={() => handleDelete(a._id, a.title)}
                className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">{a.shortDescription}</p>
            <p className="text-[11px] text-slate-400 border-t border-brand-border pt-2">{a.content}</p>
          </Card>
        ))}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        confirmText="Delete Announcement"
      />

      {showModal && (
        <Modal isOpen={true} onClose={() => setShowModal(false)} title="Broadcast Announcement">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Announcement Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <Input
              label="Short Banner Summary"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              required
            />

            <Textarea
              label="Full Announcement Body"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />

            <ImageUploadPicker
              label="Banner Image (Upload or Paste URL)"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" isLoading={loading}>
                Publish Announcement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
