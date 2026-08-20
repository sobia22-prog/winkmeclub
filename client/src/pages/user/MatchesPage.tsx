import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../../services/profile.service';
import { Profile } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Modal } from '../../components/common/Modal';
import { Sparkles, Calendar, MapPin, Heart, Flame } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all profiles from MongoDB Atlas
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileService.getMatches({});
      if (res.data.success) {
        setProfiles(res.data.profiles);
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const getAttributesTag = (index: number) => {
    const tags = [
      { text: 'Sexy & Horny', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
      { text: 'Gorgeous & Entertainer', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
      { text: 'Charming & Exotic', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
      { text: 'Stunning & Passionate', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
      { text: 'Elegance & Glamour', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    ];
    return tags[index % tags.length];
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Clean Page Header (No Filter Options per Client Request) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-wine" /> Discover Your Match
          </h1>
          <p className="text-xs text-slate-400">Explore curated VIP social profiles across major metropolitan hubs.</p>
        </div>
      </div>

      {/* Profile Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-72 p-0 overflow-hidden">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 space-y-2">
          <p className="text-base font-semibold">No profiles found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profiles.map((profile, index) => {
            const attrTag = getAttributesTag(index);
            return (
              <Card key={profile._id} hoverEffect className="overflow-hidden p-0 flex flex-col justify-between group">
                <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => setSelectedProfile(profile)}>
                  <img
                    src={profile.profileImage}
                    alt={profile.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent opacity-90" />

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {profile.isVIP && <Badge variant="vip" size="sm" />}
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-black/40" title="Online now" />
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shadow-md flex items-center gap-1 ${attrTag.color}`}>
                      <Flame className="w-3 h-3 fill-current" /> {attrTag.text}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {profile.fullName}, {profile.age}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-wine" /> {profile.city}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 line-clamp-2 italic">"{profile.bio}"</p>

                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-brand-card text-[10px] text-slate-300 rounded-md border border-brand-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-brand-border">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      View Details
                    </Button>
                    <Link to="/verification" className="flex-1">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      >
                        Apply Date
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed Profile View Modal */}
      {selectedProfile && (
        <Modal isOpen={true} onClose={() => setSelectedProfile(null)} title={`${selectedProfile.fullName}, ${selectedProfile.age}`}>
          <div className="space-y-4">
            <div className="relative h-72 rounded-2xl overflow-hidden">
              <img src={selectedProfile.profileImage} alt={selectedProfile.fullName} className="w-full h-full object-cover" />
              {selectedProfile.isVIP && (
                <div className="absolute top-3 right-3">
                  <Badge variant="vip" size="md" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100">{selectedProfile.fullName}</h3>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-wine" /> {selectedProfile.city}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-brand-card p-3 rounded-xl border border-brand-border">
                "{selectedProfile.bio}"
              </p>
            </div>

            {selectedProfile.interests && selectedProfile.interests.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block">Interests & Lifestyle</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProfile.interests.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-brand-surface text-xs text-slate-200 rounded-lg border border-brand-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-brand-border flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedProfile(null)}>
                Close
              </Button>
              <Link to="/verification">
                <Button variant="primary" leftIcon={<Calendar className="w-4 h-4" />}>
                  Apply for Date (VIP Access)
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
