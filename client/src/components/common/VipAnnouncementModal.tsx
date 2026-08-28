import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Button } from './Button';
import { Crown, Sparkles } from 'lucide-react';
import { announcementService } from '../../services/announcement.service';
import { brandConfig } from '../../config/brand.config';

export const VipAnnouncementModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<{ title: string; content: string }>({
    title: `${brandConfig.name} Gold VIP Membership Announcement`,
    content: `Welcome to ${brandConfig.name}! All members receive priority access to city encounters, 24/7 concierge support, and Airborne Product Trading privileges. Claim your Gold VIP card today.`,
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already claimed or dismissed the VIP popup
    const isAlreadyClaimed = localStorage.getItem('wink_vip_popup_claimed');
    if (isAlreadyClaimed === 'true') {
      return;
    }

    // Fetch live platform announcement or fallback
    announcementService
      .getAnnouncements()
      .then((res) => {
        if (res.data.success && res.data.announcements.length > 0) {
          setAnnouncement({
            title: res.data.announcements[0].title,
            content: res.data.announcements[0].content || res.data.announcements[0].shortDescription,
          });
        }
      })
      .catch(() => {});

    // Delay popup by 3.5 seconds after login/signup page load per requirements
    const timer = setTimeout(() => {
      const claimedCheck = localStorage.getItem('wink_vip_popup_claimed');
      if (claimedCheck !== 'true') {
        setIsOpen(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleClaimVip = () => {
    // Store claim state so popup NEVER appears again
    localStorage.setItem('wink_vip_popup_claimed', 'true');
    setIsOpen(false);

    // If client is at home page ('/' or '/home'), stay on home page.
    // If client is on any other page, redirect to verification page ('/verification').
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    if (!isHomePage) {
      navigate('/verification');
    }
  };

  const handleClose = () => {
    localStorage.setItem('wink_vip_popup_claimed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={handleClose} title="VIP Membership Exclusive Notice">
      <div className="space-y-4">
        <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-sm">
            <Crown className="w-5 h-5 fill-pink-600" /> {announcement.title}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">{announcement.content}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} type="button">
            Dismiss
          </Button>
          <Button variant="primary" onClick={handleClaimVip} leftIcon={<Crown className="w-4 h-4" />}>
            Claim Gold VIP Access
          </Button>
        </div>
      </div>
    </Modal>
  );
};
