import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { brandConfig } from '../../config/brand.config';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { MultiSelectCity } from '../../components/common/MultiSelectCity';
import { girlProfileService } from '../../services/girlProfile.service';
import {
  Sparkles,
  Calendar,
  MapPin,
  Heart,
  ArrowRight,
  Flame,
  Crown,
  Megaphone,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Star,
  Headphones,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'vip' | 'popular' | 'city'>('all');
  const [loading, setLoading] = useState(true);

  // Apply for Date Modal State
  const [applyDateProfile, setApplyDateProfile] = useState<any | null>(null);

  // Fetch admin-curated Girl Profiles from backend
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      let cityQuery = selectedCities.length > 0 ? selectedCities.join(',') : 'All';
      if (activeFilter === 'city' && selectedCities.length === 0) {
        cityQuery = user?.city || 'Mumbai';
      }

      const res = await girlProfileService.getPublicProfiles({
        city: cityQuery,
      });

      if (res.data.success) {
        let list = res.data.profiles || [];
        if (activeFilter === 'vip') {
          list = list.filter((p: any) => p.verificationLabel?.includes('VIP') || p.tags?.includes('VIP'));
        } else if (activeFilter === 'popular') {
          list = list.filter((p: any) => (p.initialLikes ?? 0) > 400);
        }
        setProfiles(list);
      }
    } catch (err) {
      console.error('Failed to load girl profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCities, activeFilter, user?.city]);

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
    <div className="space-y-6 w-full">
      {/* Hero Banner Card 1 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-rose-600 to-brand-wine border border-rose-400/30 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-[10px] font-extrabold tracking-widest uppercase text-pink-200">
              OFFICIAL VIP CLUB
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Girls' Love
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
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-2 border-white/40 shadow-xl shrink-0"
          />
        </div>
      </div>

      {/* Official Announcement: VIP Card Benefits Broadcast */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-brand-surface to-brand-surface border border-amber-500/40 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
              <Megaphone className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL ANNOUNCEMENT
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 flex items-center justify-center md:justify-start gap-2">
              <Crown className="w-6 h-6 text-amber-400 fill-amber-400" /> VIP Card Benefits & Privileges Broadcast
            </h2>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Unlock the official {brandConfig.name} Gold VIP Membership Card to access exclusive encounters, airborne trading privileges, and priority profile dispatches.
            </p>
          </div>

          <Link to="/verification" className="shrink-0">
            <Button variant="gold" size="md" leftIcon={<Crown className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Claim Gold VIP Card
            </Button>
          </Link>
        </div>

        {/* 4 VIP Card Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-amber-500/20">
          <div className="p-3.5 bg-brand-card/70 border border-brand-border rounded-2xl space-y-1">
            <div className="text-amber-400 font-extrabold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Unlimited Encounters
            </div>
            <p className="text-[11px] text-slate-400">Direct city-matching & profile dispatches in all cities.</p>
          </div>

          <div className="p-3.5 bg-brand-card/70 border border-brand-border rounded-2xl space-y-1">
            <div className="text-amber-400 font-extrabold text-xs flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Airborne Product Trade
            </div>
            <p className="text-[11px] text-slate-400">Exclusive access to product trading & round settlements.</p>
          </div>

          <div className="p-3.5 bg-brand-card/70 border border-brand-border rounded-2xl space-y-1">
            <div className="text-amber-400 font-extrabold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Gold VIP Badge
            </div>
            <p className="text-[11px] text-slate-400">Verified gold trust mark displayed on your profile.</p>
          </div>

          <div className="p-3.5 bg-brand-card/70 border border-brand-border rounded-2xl space-y-1">
            <div className="text-amber-400 font-extrabold text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 3x Priority Reach
            </div>
            <p className="text-[11px] text-slate-400">3x engagement rate & priority concierge support.</p>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base md:text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Recommended Girl Profiles
          </h2>
          <Link to="/matches" className="text-xs text-brand-wine hover:underline font-bold flex items-center gap-1">
            View All Encounters <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recommended Girl Profiles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-slate-800/50">
              <div className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-400 space-y-2">
          <p className="font-semibold">No girl profiles found for selected cities.</p>
          <p className="text-[11px] text-slate-500">Try selecting additional cities in the dropdown above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {profiles.slice(0, 6).map((profile, index) => {
            const attrTag = getAttributesTag(index, profile);
            return (
              <Card key={profile._id} hoverEffect className="p-0 overflow-hidden flex flex-col justify-between group">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent opacity-95" />

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
                      <h3 className="text-lg font-extrabold text-white">
                        {profile.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {profile.rating || 5.0}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {profile.location} • {profile.height} • {profile.weight}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 line-clamp-2 italic font-medium">"{profile.bio || profile.details}"</p>

                  <div className="flex items-center gap-2 pt-2 border-t border-brand-border">
                    <Link to="/matches" className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        View Detail
                      </Button>
                    </Link>
                    <Button
                      variant="gold"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-extrabold border-0 shadow-lg shadow-purple-600/30"
                      leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      onClick={() => setApplyDateProfile(profile)}
                    >
                      Apply for a date
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* APPLY FOR A DATE POPUP MODAL (Matching Screenshot 1) */}
      {applyDateProfile && (
        <Modal
          isOpen={true}
          onClose={() => setApplyDateProfile(null)}
          title="Apply for a date"
          subtitle={`Profile: ${applyDateProfile.name}`}
          maxWidth="sm"
        >
          <div className="space-y-6 pt-1 text-center">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Please contact customer service to apply for this date.
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
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-extrabold border-0 shadow-lg shadow-purple-600/30"
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
