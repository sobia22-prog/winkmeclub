import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { brandConfig } from '../../config/brand.config';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { girlProfileService } from '../../services/girlProfile.service';
import {
  Sparkles,
  Calendar,
  MapPin,
  Flame,
  Crown,
  Megaphone,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Star,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useSystemSettings();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDateProfile, setApplyDateProfile] = useState<any | null>(null);

  // Fetch admin-curated Girl Profiles from backend (STRICTLY FROM DATABASE ONLY)
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await girlProfileService.getPublicProfiles({ city: 'All' });
      if (res.data.success) {
        setProfiles(res.data.profiles || []);
      } else {
        setProfiles([]);
      }
    } catch (err) {
      console.error('Failed to load girl profiles:', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Automatic Profile Rotation Interval (Refreshes profile order every 4s smoothly without any button click)
  useEffect(() => {
    if (profiles.length <= 1) return;
    const rotationTimer = setInterval(() => {
      setProfiles((prev) => {
        if (prev.length <= 1) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 4000);

    return () => clearInterval(rotationTimer);
  }, [profiles.length]);

  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

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
    <div className="space-y-6 w-full pb-20">
      {/* Hero Banner Card 1 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-extrabold tracking-widest uppercase text-white">
              {t('officialVipClub')}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              {t('girlsLove')}
            </h1>
            <p className="text-xs md:text-sm text-pink-100 font-medium max-w-md">
              A CLUB OF LOVE ENCOUNTERS IN THE SAME CITY. LOVE TONIGHT.
            </p>
            <div className="pt-2">
              <Link to="/matches">
                <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Explore Encounters
                </Button>
              </Link>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80"
            alt="Girls Love Banner"
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-2 border-white/60 shadow-lg shrink-0"
          />
        </div>
      </div>

      {/* Official Announcement: VIP Card Benefits Broadcast */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
              <Megaphone className="w-3.5 h-3.5 text-amber-600" /> OFFICIAL ANNOUNCEMENT
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
              <Crown className="w-6 h-6 text-amber-500 fill-amber-500" /> VIP Card Benefits & Privileges Broadcast
            </h2>
            <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
              Unlock the official {brandConfig.name} Gold VIP Membership Card to access exclusive encounters, airborne trading privileges, and priority profile dispatches.
            </p>
          </div>

          <Link to="/verification" className="shrink-0">
            <Button variant="gold" size="md" leftIcon={<Crown className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t('claimVipCard')}
            </Button>
          </Link>
        </div>

        {/* 4 VIP Card Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3.5 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-1">
            <div className="text-pink-600 font-extrabold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Unlimited Encounters
            </div>
            <p className="text-[11px] text-slate-500">Direct city-matching & profile dispatches in all cities.</p>
          </div>

          <div className="p-3.5 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-1">
            <div className="text-pink-600 font-extrabold text-xs flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Airborne Product Trade
            </div>
            <p className="text-[11px] text-slate-500">Exclusive access to product trading & round settlements.</p>
          </div>

          <div className="p-3.5 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-1">
            <div className="text-pink-600 font-extrabold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Gold VIP Badge
            </div>
            <p className="text-[11px] text-slate-500">Verified gold trust mark displayed on your profile.</p>
          </div>

          <div className="p-3.5 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-1">
            <div className="text-pink-600 font-extrabold text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 3x Priority Reach
            </div>
            <p className="text-[11px] text-slate-500">3x engagement rate & priority concierge support.</p>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <h2 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-600 animate-spin" /> {t('recommendedProfiles')}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-pink-600 flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-full animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> Auto-Refreshing Live
            </span>
            <Link to="/matches" className="text-xs text-pink-600 hover:underline font-bold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Girl Profiles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-72 animate-pulse bg-slate-100">
              <div className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.slice(0, 6).map((profile, index) => {
            const attrTag = getAttributesTag(index, profile);
            const qualities = getQualities(index, profile);

            return (
              <Card key={profile._id || index} hoverEffect className="p-0 overflow-hidden flex flex-col justify-between group bg-white border border-slate-200 hover:border-pink-300 transition-all duration-300 shadow-sm">
                {/* Profile Photo Container */}
                <div className="relative h-72 overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedProfile(profile)}>
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

                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 ${attrTag.color}`}>
                      {attrTag.text}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold text-white">
                        {profile.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {profile.rating || 5.0}
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {profile.location} • {profile.height || "162cm"} • {profile.weight || "52kg"}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
                  <p className="text-xs text-slate-600 line-clamp-2 italic font-medium">"{profile.bio || profile.details}"</p>

                  {/* Qualities / Categories Badges on Card */}
                  <div className="flex flex-wrap gap-1.5">
                    {qualities.map((q: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-pink-50 text-pink-700 text-[10px] rounded-md border border-pink-200 font-bold">
                        {q}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      {t('viewDetail')}
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold border-0 shadow-md"
                      leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      onClick={() => setApplyDateProfile(profile)}
                    >
                      {t('applyForDate')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* DETAILED GIRL PROFILE VIEW MODAL */}
      {selectedProfile && (
        <Modal isOpen={true} onClose={() => setSelectedProfile(null)} title={`${selectedProfile.name} — Profile Details`}>
          <div className="space-y-4 text-xs">
            <div className="relative h-72 rounded-2xl overflow-hidden bg-black">
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
                    <Sparkles className="w-3 h-3 text-pink-600" /> {selectedProfile.initialLikes || 500} Likes
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
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Please contact customer service to apply for a date with <strong className="text-slate-900">{applyDateProfile.name}</strong>.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setApplyDateProfile(null)}
                className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold px-5"
              >
                Close
              </Button>
              <Button
                variant="gold"
                size="md"
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold border-0 shadow-md"
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
