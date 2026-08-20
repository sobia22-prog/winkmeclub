import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { brandConfig } from '../../config/brand.config';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Crown,
  ShoppingBag,
  Heart,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Clean Single VIP Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/70 via-brand-surface to-brand-surface border border-amber-500/40 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> WINKMEDATINGCLUB GOLD VIP
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100">
              VIP Privileges & Airborne Trading
            </h1>
          </div>

          <Badge variant="verified">100% VERIFIED & ACTIVE</Badge>
        </div>

        {/* Member Greeting & Direct Trading CTA */}
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome, <strong className="text-slate-100 font-extrabold">{user?.fullName || 'VIP Member'}</strong>! Your account profile is verified. You have instant access to product trading activities and round settlement outcomes.
          </p>

          <Link to="/trades" className="block">
            <button
              type="button"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" /> Start Airborne Product Trading Now <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Quick Nav Links */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            to="/matches"
            className="p-3.5 rounded-2xl bg-brand-card border border-brand-border text-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:border-pink-500/50 transition-all"
          >
            <Heart className="w-4 h-4 text-pink-500" /> Explore Encounters
          </Link>

          <Link
            to="/wallet"
            className="p-3.5 rounded-2xl bg-brand-card border border-brand-border text-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:border-emerald-500/50 transition-all"
          >
            <Wallet className="w-4 h-4 text-emerald-400" /> Add Funds / Wallet
          </Link>
        </div>
      </div>

      {/* Clean 4-Grid Benefits Overview */}
      <Card className="p-6 space-y-4 bg-brand-surface border border-brand-border">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Active VIP Membership Privileges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-4 bg-brand-card rounded-2xl border border-brand-border space-y-1">
            <div className="font-extrabold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" /> Airborne Product Trading
            </div>
            <p className="text-[11px] text-slate-400">Trade luxury products and claim settlement outcomes.</p>
          </div>

          <div className="p-4 bg-brand-card rounded-2xl border border-brand-border space-y-1">
            <div className="font-extrabold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Gold Trust Badge
            </div>
            <p className="text-[11px] text-slate-400">Verified gold status mark displayed on your profile.</p>
          </div>

          <div className="p-4 bg-brand-card rounded-2xl border border-brand-border space-y-1">
            <div className="font-extrabold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" /> 3x Priority Dispatches
            </div>
            <p className="text-[11px] text-slate-400">3x engagement & priority encounter proposals.</p>
          </div>

          <div className="p-4 bg-brand-card rounded-2xl border border-brand-border space-y-1">
            <div className="font-extrabold text-slate-100 flex items-center gap-2">
              <Crown className="w-4 h-4 text-pink-400" /> VIP Support Concierge
            </div>
            <p className="text-[11px] text-slate-400">24/7 dedicated support desk assistance.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
