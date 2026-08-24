import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { brandConfig } from '../../config/brand.config';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Lock, ShieldCheck, FileText, CheckSquare, Square, Key } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { loginSession } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'Mumbai',
    gender: 'Female',
    invitationCode: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions and Account Credential Guidelines to register.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register(formData);
      if (res.data.success) {
        loginSession(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-wine to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-brand-wine/30">
            <span className="font-extrabold text-xl text-white">W</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100">{brandConfig.name}</h2>
          <p className="text-xs text-slate-400">Create your account to explore VIP membership</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Staff Invitation Code (Required)"
            name="invitationCode"
            placeholder="e.g. ST1234"
            value={formData.invitationCode}
            onChange={handleChange}
            leftIcon={<Key className="w-4 h-4 text-amber-400" />}
            helperText="Enter the official staff invitation code provided by administration."
            required
          />
          <Input
            label="Full Name"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            leftIcon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@domain.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              options={brandConfig.cities.map((c) => ({ label: c, value: c }))}
            />
            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { label: 'Female', value: 'Female' },
                { label: 'Male', value: 'Male' },
                { label: 'Non-Binary', value: 'Non-Binary' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          {/* Terms and Conditions Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-brand-border text-brand-wine focus:ring-brand-wine cursor-pointer shrink-0"
              />
              <span>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-brand-wine hover:underline font-bold"
                >
                  Terms & Conditions & Account Credential Policy
                </button>
              </span>
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-brand-border">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-wine hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowTermsModal(false)}
          title={`${brandConfig.name} — Terms of Service & Account Policy`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            <div className="p-4 bg-brand-card border border-brand-border rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-5 h-5 text-brand-wine" />
                Mandatory Membership Terms & Guidelines
              </h4>
              <p className="text-[11px] text-slate-400">
                Please review the official user policy for account credentials, privacy, and system access.
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-amber-400">
                Section 1: Account Credentials & Liability Disclaimer
              </h5>
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 space-y-2">
                <p className="font-bold">Important Notice Regarding Account Details & Lost Passwords:</p>
                <p>
                  Winkmedatingclub operates as a self-managed, encrypted private membership platform. If a user forgets, loses, misplaces, compromises, or exposes their account details, login credentials, passwords, security tokens, or phone verification numbers, the company and platform administrators shall NOT be held responsible, liable, or accountable under any circumstances.
                </p>
                <p>
                  Every registered member bears sole, absolute, and exclusive responsibility for maintaining the confidentiality, storage, and backup of their account login information. By checking the agreement box during registration, you explicitly waive all claims against Winkmedatingclub regarding lost, unverified, or forgotten account credentials.
                </p>
              </div>

              <h5 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-amber-400 pt-2">
                Section 2: VIP Verification & Security Compliance
              </h5>
              <p>
                VIP Membership badges and product trading privileges require government ID document verification. All submitted identity documents are encrypted and evaluated under strict security protocols.
              </p>

              <h5 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-amber-400 pt-2">
                Section 3: Wallet Transactions & Position Holds
              </h5>
              <p>
                All wallet balances, add-funds recharges, bank withdrawal requests, and trade position holds are logged on the audit ledger and settled under official administrative review.
              </p>
            </div>

            <div className="pt-4 border-t border-brand-border flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
              >
                I Agree & Accept Terms
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
