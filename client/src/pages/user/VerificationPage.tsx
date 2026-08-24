import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Crown, ShieldCheck, ArrowRight, Sparkles, Lock } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-20">
      {/* Top Banner Badge: VIP Verification */}
      <div className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-center shadow-lg">
        <h1 className="text-sm font-extrabold text-white uppercase tracking-wider">
          VIP Verification
        </h1>
      </div>

      {/* Hero Banner Card with VIP Benefits Button */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-fuchsia-600 p-8 text-center text-white shadow-2xl space-y-4">
        <div className="py-6 px-4 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/trades')}
            className="px-8 py-3.5 rounded-2xl bg-pink-500 hover:bg-pink-400 text-white font-black text-sm tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          >
            VIP Benefits
          </button>
        </div>
      </div>

      {/* Why Go VIP? Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 text-center">Why Go VIP?</h2>

        <div className="space-y-3">
          {/* Card 1: Premium Access */}
          <div className="p-5 bg-brand-surface border border-brand-border rounded-2xl text-center space-y-1.5 shadow-md">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Premium Access</h3>
            <p className="text-xs text-slate-400">Unlock all features and profiles</p>
          </div>

          {/* Card 2: Verified Members */}
          <div className="p-5 bg-brand-surface border border-brand-border rounded-2xl text-center space-y-1.5 shadow-md">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Verified Members</h3>
            <p className="text-xs text-slate-400">Connect with trusted profiles</p>
          </div>
        </div>
      </div>
    </div>
  );
};
