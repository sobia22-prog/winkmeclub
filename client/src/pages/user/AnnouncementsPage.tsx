import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { announcementService } from '../../services/announcement.service';
import { Announcement } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Megaphone, ArrowLeft, Bell, Info } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'NOTICE' | 'ACTIVITY'>('NOTICE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementService
      .getAnnouncements()
      .then((res) => {
        if (res.data.success) {
          setAnnouncements(res.data.announcements || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredAnnouncements = announcements.filter((item: any) => {
    if (activeTab === 'NOTICE') return !item.type || item.type === 'NOTICE' || item.type === 'GENERAL';
    if (activeTab === 'ACTIVITY') return item.type === 'ACTIVITY' || item.type === 'EVENT';
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-24">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-pink-600" /> Announcements
            </h1>
            <p className="text-[11px] text-slate-500">Important updates, notices, and events</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">More</span>
      </div>

      {/* Filter Tabs: Notice vs Activity (Matching Screenshot 100%) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 border border-slate-200 rounded-2xl shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('NOTICE')}
          className={`py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'NOTICE'
              ? 'bg-pink-50 border border-pink-200 text-pink-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Info className="w-4 h-4 text-pink-600" />
          Notice
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVITY')}
          className={`py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ACTIVITY'
              ? 'bg-pink-50 border border-pink-200 text-pink-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4 text-pink-600" />
          Activity
        </button>
      </div>

      {/* Announcements Main Card Container (Matching Screenshot 100%) */}
      <Card className="p-6 space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm min-h-[350px] flex flex-col justify-between">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-xs text-slate-500 gap-2">
            <Megaphone className="w-8 h-8 text-pink-400 animate-pulse" />
            <p>Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center my-auto">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-sm">
              <Megaphone className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">No announcement data</h3>
              <p className="text-[11px] text-slate-500">No updates available for {activeTab === 'NOTICE' ? 'notices' : 'activities'} at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4 text-left">
            {filteredAnnouncements.map((item) => (
              <div key={item._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:border-pink-300 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                  <Badge variant="neutral" size="sm">{activeTab === 'NOTICE' ? 'Notice' : 'Activity'}</Badge>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{item.shortDescription || item.content}</p>
                <span className="text-[10px] text-slate-500 font-mono block pt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Tag Label (Matching Screenshot) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-start">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            {activeTab === 'NOTICE' ? 'Notice' : 'Activity'}
          </span>
        </div>
      </Card>
    </div>
  );
};
