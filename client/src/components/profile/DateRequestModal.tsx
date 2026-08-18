import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { profileService } from '../../services/profile.service';
import { Profile } from '../../types';
import { Calendar, Clock, Heart } from 'lucide-react';

interface DateRequestModalProps {
  profile: Profile;
  onClose: () => void;
}

export const DateRequestModal: React.FC<DateRequestModalProps> = ({ profile, onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');
  const [message, setMessage] = useState(`Hi ${profile.fullName}, I'd love to invite you for a pleasant dinner date.`);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await profileService.sendDateRequest({
        targetProfileId: profile._id,
        date,
        time,
        message,
      });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit date request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Apply for Date with ${profile.fullName}`}>
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Heart className="w-7 h-7 fill-emerald-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-100">Proposal Sent!</h4>
          <p className="text-xs text-slate-400">
            Your date request has been delivered. You will be notified when {profile.fullName} responds.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-brand-card border border-brand-border rounded-xl">
            <img src={profile.profileImage} alt={profile.fullName} className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <h4 className="text-sm font-bold text-slate-100">{profile.fullName}, {profile.age}</h4>
              <p className="text-xs text-slate-400">📍 {profile.city}</p>
            </div>
          </div>

          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Preferred Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
              required
            />
            <Input
              label="Preferred Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
              required
            />
          </div>

          <Textarea
            label="Invitation Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading} leftIcon={<Heart className="w-4 h-4" />}>
              Submit Proposal
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
