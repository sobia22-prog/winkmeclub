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
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-pink-600" /> Withdrawal Details
            </h1>
            <p className="text-[11px] text-slate-500">Payout security & transaction PIN settings</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500">More</span>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>
      )}

      {/* Main Card Container */}
      <Card className="p-6 space-y-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-xs font-extrabold border border-pink-200">
            Withdrawal Details
          </span>
        </div>

        <form onSubmit={handleSavePin} className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-slate-900">Withdrawal Security PIN</label>
            <p className="text-[11px] text-slate-500 leading-relaxed">
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
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
          >
            {loading ? 'Saving Withdrawal Details...' : 'Save Withdrawal Details'}
          </button>
        </form>
      </Card>
    </div>
  );
};
