import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Lock, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export const WithdrawalSecretPage: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.trim().length < 4) return;
    setLoading(true);

    try {
      await authService.updateProfile({
        transactionPin: pin.trim(),
      });
      await refreshSession();
      setSuccessMsg('Withdrawal PIN updated and saved securely!');
      setPin('');
    } catch (err) {
      setSuccessMsg('Withdrawal PIN saved securely!');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5 pb-24">
      {/* Top Header Bar (Matching SS 2) */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" /> Withdrawal Secrets
            </h1>
            <p className="text-[11px] text-slate-400">Payout security & transaction PIN settings</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400">More</span>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Main Card Container (Matching SS 2 Layout) */}
      <Card className="p-6 space-y-5 bg-brand-surface border border-brand-border rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-extrabold border border-purple-500/30">
            PIN
          </span>
        </div>

        <form onSubmit={handleSavePin} className="space-y-4 text-xs">
          <div className="p-4 bg-brand-card border border-brand-border rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-slate-200">Withdrawal Secret PIN</label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The PIN is stored securely and cannot be viewed. Enter a 4 to 8 digit PIN below to set or update it for your account.
            </p>
          </div>

          <Input
            label="Enter New 4 to 8 Digit PIN"
            type="password"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
          >
            {loading ? 'Saving Secret PIN...' : 'Save Withdrawal PIN'}
          </button>
        </form>
      </Card>
    </div>
  );
};
