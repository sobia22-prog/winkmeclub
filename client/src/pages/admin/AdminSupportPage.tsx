import React, { useState, useEffect } from 'react';
import { systemSettingsService } from '../../services/systemSettings.service';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { ImageUploadPicker } from '../../components/common/ImageUploadPicker';
import { Headphones, CheckCircle2, Save } from 'lucide-react';

export const AdminSupportPage: React.FC = () => {
  const [telegramSupportLink, setTelegramSupportLink] = useState('https://t.me/winkmedatingclub_support');
  const [telegramSupportMessage, setTelegramSupportMessage] = useState(
    'Need help or have questions? Reach out to our dedicated 24/7 customer service team directly on Telegram.'
  );
  const [telegramSupportQrCode, setTelegramSupportQrCode] = useState(
    'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://t.me/winkmedatingclub_support'
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await systemSettingsService.getSettings();
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        if (s.telegramSupportLink) setTelegramSupportLink(s.telegramSupportLink);
        if (s.telegramSupportMessage) setTelegramSupportMessage(s.telegramSupportMessage);
        if (s.telegramSupportQrCode) setTelegramSupportQrCode(s.telegramSupportQrCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await systemSettingsService.updateSettings({
        telegramSupportLink,
        telegramSupportMessage,
        telegramSupportQrCode,
      });

      if (res.data.success) {
        setMessage('Customer service Telegram settings updated successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update customer service settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading Customer Service Settings...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Headphones className="w-6 h-6 text-pink-600" /> Customer Service
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Telegram QR, link, and message shown on the member Customer Service page
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold shadow-sm">
          {error}
        </div>
      )}

      {/* Direct Form without extra Card wrapper (Full Width) */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Telegram Link */}
        <Input
          label="Telegram link"
          placeholder="https://t.me/your_handle"
          value={telegramSupportLink}
          onChange={(e) => setTelegramSupportLink(e.target.value)}
          helperText="Direct Telegram handle or channel URL for member customer support"
          required
        />

        {/* Support Message */}
        <Textarea
          label="Support message"
          placeholder="Support message shown on member Customer Service page..."
          value={telegramSupportMessage}
          onChange={(e) => setTelegramSupportMessage(e.target.value)}
          rows={4}
          required
        />

        {/* Telegram QR Image */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Telegram QR Image</label>
          <ImageUploadPicker
            value={telegramSupportQrCode}
            onChange={(url) => setTelegramSupportQrCode(url)}
            label=""
            helperText="Upload your custom Telegram Customer Service QR Code image"
            aspectRatio="square"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Customer Service Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
