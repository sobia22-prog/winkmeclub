import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const VerifyOTPPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginSession } = useAuth();

  const email = location.state?.email || '';
  const initialOtpHint = location.state?.otpDemoHint || '';

  const [otp, setOtp] = useState(initialOtpHint || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.verifyOTP({ email, otp });
      if (res.data.success) {
        loginSession(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await authService.resendOTP(email);
      setMessage('A new OTP has been sent to your email.');
      if (res.data.otpDemoHint) {
        setOtp(res.data.otpDemoHint);
      }
      setTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">Verify Email Address</h2>
          <p className="text-xs text-slate-400 mt-1">
            We sent a 6-digit OTP code to <span className="text-slate-200 font-semibold">{email}</span>
          </p>
        </div>

        {initialOtpHint && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400">
            Demo Mode Auto-Fill Code: <span className="font-mono font-bold">{initialOtpHint}</span>
          </div>
        )}

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}
        {message && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">{message}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="text-center font-mono text-lg tracking-widest"
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Verify & Proceed
          </Button>
        </form>

        <div className="pt-2">
          {timer > 0 ? (
            <p className="text-xs text-slate-500">Resend code in {timer}s</p>
          ) : (
            <button
              onClick={handleResend}
              className="text-xs text-brand-wine hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
