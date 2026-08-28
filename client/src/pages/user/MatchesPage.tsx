import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { girlProfileService } from '../../services/girlProfile.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Modal } from '../../components/common/Modal';
import { Sparkles, Calendar, MapPin, Heart, Flame, Star, Tag, CheckCircle2 } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply for Date Modal State
  const [applyDateProfile, setApplyDateProfile] = useState<any | null>(null);

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

  const getQualities = (index: number, p: any): string[] => {
    if (p.categories && Array.isArray(p.categories) && p.categories.length > 0) {
      return p.categories;
    }
    const defaultQualities = [
      ['Sexy', 'Hot'],
      ['Big Boobs', 'Sexy'],
      ['Hot', 'Charming'],
      ['Sexy', 'VIP'],
      ['Cute', 'Gorgeous'],
    ];
    return defaultQualities[index % defaultQualities.length];
  };

  const getAttributesTag = (index: number, p: any) => {
    const qualities = getQualities(index, p);
    const mainQuality = qualities[0] || 'Sexy';
    const tagColors = [
      'bg-amber-500 text-white font-bold',
      'bg-pink-500 text-white font-bold',
      'bg-rose-500 text-white font-bold',
      'bg-purple-600 text-white font-bold',
    ];
    return { text: mainQuality, color: tagColors[index % tagColors.length] };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-600" /> Discover Your VIP Match
          </h1>
          <p className="text-xs text-slate-500">Explore curated VIP social profiles across major metropolitan hubs.</p>
        </div>
      </div>

      {/* Profile Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-72 p-0 overflow-hidden bg-white">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 bg-white space-y-2">
          <p className="text-base font-semibold">No girl profiles found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profiles.map((profile, index) => {
            const attrTag = getAttributesTag(index, profile);
            const qualities = getQualities(index, profile);

            return (
              <Card key={profile._id} hoverEffect className="overflow-hidden p-0 flex flex-col justify-between bg-white border border-slate-200 shadow-sm rounded-2xl group">
                <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => setSelectedProfile(profile)}>
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <Badge variant="verified" size="sm">{profile.verificationLabel || 'ID Verified'}</Badge>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-black/40" title="Online now" />
                  </div>

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 ${attrTag.color}`}>
                      {attrTag.text}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {profile.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {profile.rating || 5.0}
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {profile.location} • Height: {profile.height || "162cm"} • Chest: {profile.chestCircumference || "34B"}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
                  <p className="text-xs text-slate-600 line-clamp-2 italic">"{profile.bio || profile.details}"</p>

                  <div className="flex flex-wrap gap-1.5">
                    {qualities.map((cat: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-pink-50 text-pink-700 text-[10px] rounded-md border border-pink-200 font-bold">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setApplyDateProfile(profile)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs md:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" /> Apply for a date
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(profile)}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      View Profile Details
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Real Time Status Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 p-5 md:p-6 text-white shadow-xl space-y-3 border border-pink-400/30">
        <h3 className="text-center font-extrabold text-sm md:text-base text-white uppercase tracking-wider">
          Real time status
        </h3>
        <div className="space-y-1.5 text-center text-xs text-white/90 font-medium">
          <p>a0***10 Joined as a member</p>
          <p>u0***18 Joined as a member</p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-bold">
              ★ 100% ID Verified
            </span>
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-bold">
              ♥ Live Social Matching
            </span>
          </div>
        </div>
      </div>

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
                  <h3 className="text-lg font-black text-slate-900">{selectedProfile.name}</h3>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-pink-600" /> {selectedProfile.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-black">
                    <Star className="w-4 h-4 fill-amber-500" /> {selectedProfile.rating || 5.0}
                  </div>
                  <div className="text-[10px] text-pink-600 font-semibold flex items-center justify-end gap-1 mt-0.5">
                    <Heart className="w-3 h-3 fill-pink-600" /> {selectedProfile.initialLikes || 500} Likes
                  </div>
                </div>
              </div>

              {/* Qualities / Categories Badges in Detail View */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Qualities & Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {getQualities(0, selectedProfile).map((q: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-full text-xs font-bold shadow-sm">
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              {/* Physical Attributes Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-pink-50/50 border border-pink-100 rounded-xl text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Height</span>
                  <span className="font-bold text-slate-900">{selectedProfile.height || "162 cm"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Weight</span>
                  <span className="font-bold text-slate-900">{selectedProfile.weight || '52 kg'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Chest</span>
                  <span className="font-bold text-pink-600">{selectedProfile.chestCircumference || '34B'}</span>
                </div>
              </div>

              {selectedProfile.bio && (
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                  "{selectedProfile.bio}"
                </p>
              )}

              {selectedProfile.details && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">About Her</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedProfile.details}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedProfile(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold shadow-md"
                leftIcon={<Calendar className="w-4 h-4" />}
                onClick={() => {
                  setApplyDateProfile(selectedProfile);
                  setSelectedProfile(null);
                }}
              >
                Apply for a date
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* APPLY FOR A DATE POPUP MODAL */}
      {applyDateProfile && (
        <Modal
          isOpen={true}
          onClose={() => setApplyDateProfile(null)}
          title="Apply for a date"
          subtitle={`Profile: ${applyDateProfile.name}`}
          maxWidth="sm"
        >
          <div className="space-y-6 pt-1 text-center">
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Please contact customer service to apply for this date.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setApplyDateProfile(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold px-5"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold shadow-md"
                onClick={() => {
                  setApplyDateProfile(null);
                  navigate('/support');
                }}
              >
                Contact Customer Service
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
