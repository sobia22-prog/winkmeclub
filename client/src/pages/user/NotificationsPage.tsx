import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import { Notification } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-pink-600" /> Notification Center
          </h1>
          <p className="text-xs text-slate-500">Updates regarding verification, date requests, trade outcomes, & balance additions.</p>
        </div>

        <Button variant="secondary" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />} onClick={handleMarkAllRead}>
          Mark All Read
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200">Loading notifications...</Card>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200">No notifications found.</Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              onClick={() => n.link && navigate(n.link)}
              className={`flex items-start justify-between gap-4 cursor-pointer hover:border-pink-300 transition-all ${
                !n.isRead ? 'bg-pink-50 border-pink-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-pink-600" />}
                </div>
                <p className="text-xs text-slate-700">{n.message}</p>
                <span className="text-[10px] text-slate-500 block pt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              <Badge variant="neutral" size="sm">
                {n.type}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
