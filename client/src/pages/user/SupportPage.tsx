import React, { useState, useEffect } from 'react';
import { systemSettingsService } from '../../services/systemSettings.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Headphones, Send, MessageCircle, ExternalLink, QrCode, ShieldCheck } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [telegramSupportUrl, setTelegramSupportUrl] = useState('https://t.me/winkmedatingclub_support');
  const [telegramSupportQrCode, setTelegramSupportQrCode] = useState(
    'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://t.me/winkmedatingclub_support'
  );
  const [telegramSupportMessage, setTelegramSupportMessage] = useState(
    'Need help or have questions? Reach out to our dedicated 24/7 customer service team directly on Telegram.'
  );

  useEffect(() => {
    systemSettingsService
      .getSettings()
      .then((res) => {
        if (res.data.success && res.data.settings) {
          if (res.data.settings.telegramSupportLink) setTelegramSupportUrl(res.data.settings.telegramSupportLink);
          if (res.data.settings.telegramSupportQrCode) setTelegramSupportQrCode(res.data.settings.telegramSupportQrCode);
          if (res.data.settings.telegramSupportMessage) setTelegramSupportMessage(res.data.settings.telegramSupportMessage);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
          <Headphones className="w-6 h-6 text-amber-400" /> Customer Service
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Connect directly with our 24/7 official Telegram Customer Service team for instant assistance.
        </p>
      </div>

      {/* Main Telegram Customer Service Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-brand-surface to-brand-surface border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Description */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
              <MessageCircle className="w-4 h-4 text-amber-400" /> 24/7 TELEGRAM SERVICE
            </div>
            
            <h2 className="text-2xl font-black text-slate-100 leading-tight">
              VIP Customer Service Desk
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {telegramSupportMessage}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href={telegramSupportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <Button
                  variant="gold"
                  size="md"
                  leftIcon={<Send className="w-4 h-4" />}
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                >
                  Contact Us on Telegram
                </Button>
              </a>
            </div>
          </div>

          {/* Right QR Code Card */}
          <div className="flex flex-col items-center bg-brand-card/90 border border-amber-500/30 p-5 rounded-2xl shadow-xl shrink-0 space-y-3">
            <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-200">
              <img
                src={telegramSupportQrCode}
                alt="Telegram Customer Service QR Code"
                className="w-36 h-36 object-contain rounded-xl"
              />
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-amber-400" /> Scan QR to Chat
              </span>
              <p className="text-[10px] text-slate-400 max-w-[140px]">
                Scan with phone camera to open Telegram chat instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
