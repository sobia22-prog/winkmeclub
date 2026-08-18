import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { announcementService } from '../../services/notification.service';
import { Announcement } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { Megaphone, PlusCircle, Trash2 } from 'lucide-react';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
  });
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getPublished();
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
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

    try {
      const res = await adminService.createAnnouncement(form);
      if (res.data.success) {
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
      alert(err.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      await adminService.deleteAnnouncement(id);
      fetchAnnouncements();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-400" /> Platform Announcement Broadcasts
          </h1>
          <p className="text-xs text-slate-400">Broadcast official announcements to user dashboards.</p>
        </div>

        <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          Create Broadcast
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((a) => (
          <Card key={a._id} className="space-y-3 relative group">
            {a.image && <img src={a.image} alt={a.title} className="w-full h-40 rounded-xl object-cover" />}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-slate-100">{a.title}</h3>
              <button
                onClick={() => handleDelete(a._id)}
                className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-300">{a.shortDescription}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{a.content}</p>
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal isOpen={true} onClose={() => setShowModal(false)} title="Create Announcement Broadcast">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              label="Short Summary"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              required
            />
            <Textarea
              label="Full Content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              required
            />
            <ImageUploadPicker
              label="Banner Image Upload"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              helperText="Upload banner image file for announcement"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={loading}>
                Publish Broadcast
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
