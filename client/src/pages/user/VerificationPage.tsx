import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { brandConfig } from '../../config/brand.config';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Crown,
  Sparkles,
  ShoppingBag,
  Heart,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Award,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/50 via-brand-surface to-brand-surface border border-amber-500/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
            <Award className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL VIP MEMBER
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center justify-center md:justify-start gap-2">
            <Crown className="w-7 h-7 text-amber-400 fill-amber-400" /> VIP Concierge & Verification
          </h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Your official Gold VIP membership card, profile verification, and exclusive privileges.
          </p>
        </div>

        <div className="p-4 bg-brand-card border border-amber-500/30 rounded-2xl shrink-0 text-center space-y-1 shadow-lg">
          <Crown className="w-9 h-9 text-amber-400 fill-amber-400 mx-auto" />
          <div className="text-xs font-bold text-slate-100">Gold VIP Active</div>
          <p className="text-[10px] text-emerald-400 font-bold">100% Verified Member</p>
        </div>
      </div>

      {/* VIP Verification Card Section */}
      <Card className="border-l-4 border-l-amber-500 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-brand-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Crown className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                VIP Account Verification Status <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h3>
              <p className="text-[11px] text-slate-400">Official Membership Clearance</p>
            </div>
          </div>

          <Badge variant="verified">100% VERIFIED & VIP ACTIVE</Badge>
        </div>

        {/* Status Message Box */}
        <div className="p-4 bg-brand-card/80 border border-brand-border rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-100">
                Welcome, {user?.fullName || 'VIP Member'}! Your account profile is officially verified.
              </p>
              <p className="text-[11px] text-slate-400">
                Your Gold VIP status and Airborne Trading privileges are 100% ACTIVE. You have immediate clearance for product trading and priority date proposals.
              </p>
            </div>
          </div>
        </div>

        {/* Metallic Gold VIP Membership Card Mockup */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 border border-amber-300/50 p-6 md:p-8 text-slate-950 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-7 h-7 fill-slate-950" />
              <span className="text-sm font-black tracking-wider uppercase">{brandConfig.name} GOLD VIP</span>
            </div>
            <span className="px-3 py-1 bg-slate-950/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-slate-950 border border-slate-950/30">
              OFFICIAL MEMBER CARD
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-900 tracking-widest block">Cardholder Name</span>
            <span className="text-xl md:text-2xl font-black tracking-wide">{user?.fullName || 'VIP Member'}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-950/20 text-xs font-bold">
            <span>CITY: {user?.city || 'Mumbai'}</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 fill-slate-950 text-amber-500" /> VERIFIED MEMBER
            </span>
          </div>
        </div>

        {/* VIP Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Link
            to="/trades"
            className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold flex flex-col items-center justify-center text-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950/10 flex items-center justify-center text-slate-950">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide">Airborne Product Trade</div>
              <div className="text-[11px] font-semibold opacity-80 mt-0.5">Access Trading Market</div>
            </div>
          </Link>

          <Link
            to="/matches"
            className="p-5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-brand-wine text-white font-extrabold flex flex-col items-center justify-center text-center gap-2 shadow-lg shadow-pink-600/20 hover:scale-[1.02] active:scale-95 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide">Explore VIP Encounters</div>
              <div className="text-[11px] font-semibold text-pink-100 mt-0.5">City Matches</div>
            </div>
          </Link>

          <Link
            to="/wallet"
            className="p-5 rounded-2xl bg-brand-card border border-brand-border text-slate-100 font-extrabold flex flex-col items-center justify-center text-center gap-2 shadow-lg hover:border-slate-500 hover:scale-[1.02] active:scale-95 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide">Manage VIP Wallet</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Add Funds & Withdrawals</div>
            </div>
          </Link>
        </div>
      </Card>

      {/* VIP Benefits Overview */}
      <Card className="p-6 space-y-4 bg-brand-surface border border-brand-border">
        <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" /> Active Gold VIP Member Benefits
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-brand-card rounded-xl border border-brand-border flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Airborne Product Trading:</strong> Trade luxury lifestyle products and claim settlement outcomes.</span>
          </div>

          <div className="p-3 bg-brand-card rounded-xl border border-brand-border flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Verified Gold Badge:</strong> Gold VIP trust badge displayed across your account and profile.</span>
          </div>

          <div className="p-3 bg-brand-card rounded-xl border border-brand-border flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>3x Priority Dispatches:</strong> 3x profile engagement and priority date request dispatches.</span>
          </div>

          <div className="p-3 bg-brand-card rounded-xl border border-brand-border flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>24/7 VIP Concierge Support:</strong> Premium membership desk & support assistance.</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
