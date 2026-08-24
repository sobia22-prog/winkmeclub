import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { girlProfileService } from '../../services/girlProfile.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Modal } from '../../components/common/Modal';
import { Sparkles, Calendar, MapPin, Heart, Flame, Star, Tag, CheckCircle2 } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin curated girl profiles
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await girlProfileService.getPublicProfiles({});
      if (res.data.success) {
        setProfiles(res.data.profiles);
      }
    } catch (err) {
      console.error('Failed to load girl profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const getAttributesTag = (index: number, p: any) => {
    if (p.categories && p.categories.length > 0) {
      return { text: p.categories[0], color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
    const tags = [
      { text: 'Sexy & Hot', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
      { text: 'Gorgeous & VIP', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
      { text: 'Charming & Exotic', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    ];
    return tags[index % tags.length];
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" /> Discover Your VIP Match
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
          <p className="text-base font-semibold">No girl profiles found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profiles.map((profile, index) => {
            const attrTag = getAttributesTag(index, profile);
            return (
              <Card key={profile._id} hoverEffect className="overflow-hidden p-0 flex flex-col justify-between group">
                <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => setSelectedProfile(profile)}>
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent opacity-90" />

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <Badge variant="verified" size="sm">{profile.verificationLabel || 'ID Verified'}</Badge>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-black/40" title="Online now" />
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shadow-md flex items-center gap-1 ${attrTag.color}`}>
                      <Flame className="w-3 h-3 fill-current" /> {attrTag.text}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {profile.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {profile.rating || 5.0}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {profile.location} • {profile.height} • {profile.weight}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 line-clamp-2 italic">"{profile.bio || profile.details}"</p>

                  {profile.categories && profile.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.categories.map((cat: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-amber-500/10 text-[10px] text-amber-400 rounded-md border border-amber-500/30 font-bold">
                          {cat}
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
                        variant="gold"
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

      {/* Detailed Girl Profile View Modal */}
      {selectedProfile && (
        <Modal isOpen={true} onClose={() => setSelectedProfile(null)} title={`${selectedProfile.name} — Profile Details`}>
          <div className="space-y-4 text-xs">
            <div className="relative h-72 rounded-2xl overflow-hidden">
              <img src={selectedProfile.profileImage} alt={selectedProfile.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <Badge variant="verified" size="md">{selectedProfile.verificationLabel || 'ID Verified'}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-100">{selectedProfile.name}</h3>
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> {selectedProfile.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400 text-sm font-black">
                    <Star className="w-4 h-4 fill-amber-400" /> {selectedProfile.rating || 5.0}
                  </div>
                  <div className="text-[10px] text-rose-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                    <Heart className="w-3 h-3 fill-rose-400" /> {selectedProfile.initialLikes || 500} Likes
                  </div>
                </div>
              </div>

              {/* Physical Attributes Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-brand-card border border-brand-border rounded-xl text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Height</span>
                  <span className="font-bold text-slate-200">{selectedProfile.height || "5'6\""}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Weight</span>
                  <span className="font-bold text-slate-200">{selectedProfile.weight || '52 kg'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Chest</span>
                  <span className="font-bold text-amber-400">{selectedProfile.chestCircumference || '34B'}</span>
                </div>
              </div>

              {selectedProfile.bio && (
                <p className="text-xs text-slate-300 leading-relaxed bg-brand-card p-3 rounded-xl border border-brand-border italic">
                  "{selectedProfile.bio}"
                </p>
              )}

              {selectedProfile.details && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">About Her</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedProfile.details}</p>
                </div>
              )}

              {selectedProfile.categories && selectedProfile.categories.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 block">Categories & Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfile.categories.map((cat: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-amber-500/10 text-xs text-amber-400 font-bold rounded-lg border border-amber-500/30">
                        {cat}
                      </span>
                    ))}
                    {Array.isArray(selectedProfile.tags) && selectedProfile.tags.map((t: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-brand-surface text-xs text-slate-300 font-medium rounded-lg border border-brand-border">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-brand-border flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedProfile(null)}>
                Close
              </Button>
              <Link to="/verification">
                <Button variant="gold" leftIcon={<Calendar className="w-4 h-4" />}>
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
