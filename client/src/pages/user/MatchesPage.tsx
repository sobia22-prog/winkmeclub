import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { brandConfig } from '../../config/brand.config';
import { profileService } from '../../services/profile.service';
import { Profile } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { MultiSelectCity } from '../../components/common/MultiSelectCity';
import { DateRequestModal } from '../../components/profile/DateRequestModal';
import { Skeleton } from '../../components/common/Skeleton';
import { Search, Calendar, Crown, MapPin, Sparkles } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [gender, setGender] = useState('All');
  const [vipOnly, setVipOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [dateModalProfile, setDateModalProfile] = useState<Profile | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const cityQuery = selectedCities.length > 0 ? selectedCities.join(',') : 'All';
      const res = await profileService.getMatches({
        city: cityQuery,
        gender,
        vipOnly,
        search,
      });
      if (res.data.success) {
        setProfiles(res.data.profiles);
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCities, gender, vipOnly, search]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-wine" /> Discover Your Match
          </h1>
          <p className="text-xs text-slate-400">Explore curated VIP social profiles across major metropolitan hubs.</p>
        </div>
      </div>

      {/* Advanced Filter Form with Multi-Select City Dropdown */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
          <Input
            placeholder="Search name, bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <MultiSelectCity
            label=""
            selectedCities={selectedCities}
            onChange={(cities) => setSelectedCities(cities)}
          />

          <Select
            label=""
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { label: 'All Genders', value: 'All' },
              { label: 'Female', value: 'Female' },
              { label: 'Male', value: 'Male' },
              { label: 'Non-Binary', value: 'Non-Binary' },
            ]}
          />

          <button
            type="button"
            onClick={() => setVipOnly(!vipOnly)}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              vipOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-brand-surface border-brand-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>VIP Only Profiles</span>
          </button>
        </form>
      </Card>

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
          <p className="text-base font-semibold">No matching profiles found for selected criteria.</p>
          <p className="text-xs text-slate-500">Try selecting additional cities or resetting your filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profiles.map((profile) => (
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
          ))}
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
                  <Badge variant="vip" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100">{selectedProfile.fullName}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-wine" /> {selectedProfile.city} • {selectedProfile.gender}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-brand-border">{selectedProfile.bio}</p>
            </div>

            {selectedProfile.interests && (
              <div>
                <h5 className="text-xs font-semibold text-slate-400 mb-2">Interests & Passions</h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProfile.interests.map((item, i) => (
                    <span key={i} className="px-2.5 py-1 bg-brand-card border border-brand-border text-xs text-slate-200 rounded-lg">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-brand-border flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedProfile(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                leftIcon={<Calendar className="w-4 h-4" />}
                onClick={() => {
                  const p = selectedProfile;
                  setSelectedProfile(null);
                  setDateModalProfile(p);
                }}
              >
                Apply for Date
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Date Request Proposal Modal */}
      {dateModalProfile && (
        <DateRequestModal
          profile={dateModalProfile}
          onClose={() => setDateModalProfile(null)}
        />
      )}
    </div>
  );
};
