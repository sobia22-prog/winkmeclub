import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { announcementService } from '../../services/announcement.service';
import { Announcement } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Megaphone, ArrowLeft, Bell, Info } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOTICE'>('ALL');
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

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-24">
      {/* Top Header Bar with Back Link */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-pink-600" /> Announcements
            </h1>
            <p className="text-[11px] text-slate-500">System updates & notices</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500">More</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 border border-slate-200 rounded-2xl shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'ALL'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('NOTICE')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'NOTICE'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Notice
        </button>
      </div>

      {/* Announcements Body Box */}
      <Card className="p-8 space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
        {loading ? (
          <p className="text-xs text-slate-500">Loading system announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="space-y-3 py-6">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center mx-auto text-pink-600 shadow-sm">
              <Megaphone className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">No announcements yet</h3>
              <p className="text-[11px] text-slate-500">Check back later for new platform updates and official notices.</p>
            </div>
            <div className="pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600">
                Notice
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4 text-left">
            {announcements.map((item) => (
              <div key={item._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <Badge variant="neutral" size="sm">Notice</Badge>
                </div>
                <p className="text-xs text-slate-700">{item.shortDescription || item.content}</p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
