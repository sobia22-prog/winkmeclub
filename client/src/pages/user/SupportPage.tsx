import React, { useState, useEffect } from 'react';
import { systemSettingsService } from '../../services/systemSettings.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Headphones, Send, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [telegramSupportUrl, setTelegramSupportUrl] = useState('https://t.me/winkmedatingclub_support');
  const [telegramSupportQrCode, setTelegramSupportQrCode] = useState(
    'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://t.me/winkmedatingclub_support'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    systemSettingsService
      .getSettings()
      .then((res) => {
        if (res.data.success && res.data.settings) {
          if (res.data.settings.telegramSupportLink) setTelegramSupportUrl(res.data.settings.telegramSupportLink);
          if (res.data.settings.telegramSupportQrCode) setTelegramSupportQrCode(res.data.settings.telegramSupportQrCode);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(telegramSupportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-4 text-center">
      {/* Header matching Screenshot 3 */}
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center justify-center gap-2">
          <Headphones className="w-5 h-5 text-amber-400" /> Customer Service
        </h1>
        <p className="text-xs text-slate-400">
          Scan the QR or contact us on Telegram for support.
        </p>
      </div>

      {/* Center White Card matching Screenshot 3 */}
      <Card className="p-6 md:p-8 space-y-6 bg-brand-surface border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col items-center">
        {/* QR Code Container */}
        <div className="relative p-3 bg-slate-950 border border-amber-500/40 rounded-2xl shadow-xl flex flex-col items-center max-w-[260px]">
          <div className="bg-white p-2.5 rounded-xl shadow-md">
            <img
              src={telegramSupportQrCode}
              alt="Telegram Customer Service QR Code"
              className="w-48 h-48 object-contain rounded-lg"
            />
          </div>

          <div className="text-[11px] font-bold text-amber-400 font-mono mt-2 flex items-center justify-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-amber-400" /> @CUSTOMER_SUPPORT
          </div>
        </div>

        {/* Buttons Row matching Screenshot 3 */}
        <div className="flex items-center justify-center gap-3 w-full max-w-xs pt-2">
          <Button
            variant="secondary"
            size="md"
            className="flex-1 border-slate-700 hover:border-slate-500"
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopyLink}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>

          <a
            href={telegramSupportUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button
              variant="gold"
              size="md"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-600/30"
              leftIcon={<Send className="w-4 h-4" />}
            >
              Open Telegram
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
};
