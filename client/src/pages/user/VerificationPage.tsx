import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profile.service';
import { Verification } from '../../types';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Crown, Clock, XCircle, Upload, CheckCircle2, Award, FileText, Camera } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const idFileInputRef = useRef<HTMLInputElement>(null);
  const selfieFileInputRef = useRef<HTMLInputElement>(null);

  const [verification, setVerification] = useState<Verification | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    dob: '1998-05-14',
    idType: 'Passport',
    idNumber: '',
    idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
    selfieUrl: user?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await profileService.getVerificationStatus();
      if (res.data.success) {
        setVerification(res.data.verification);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Selected document file exceeds 5MB size limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, idDocumentUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Selected selfie file exceeds 5MB size limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, selfieUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await profileService.submitVerification(formData);
      if (res.data.success) {
        setSuccess('Verification request submitted for admin review.');
        fetchStatus();
        refreshSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-brand-surface to-brand-surface border border-amber-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
            <Crown className="w-3.5 h-3.5 fill-amber-400" /> VIP EXCLUSIVE PRIVILEGES
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">Become a Verified VIP</h1>
          <p className="text-xs text-slate-300 max-w-lg">
            Verify your government identity to unlock the Gold VIP badge, 3x profile engagement, priority date request dispatches, and premium trust status.
          </p>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border rounded-2xl shrink-0 text-center space-y-1">
          <Award className="w-10 h-10 text-amber-400 mx-auto" />
          <div className="text-xs font-bold text-slate-100">100% Secure</div>
          <p className="text-[10px] text-slate-400">Encrypted Document Vault</p>
        </div>
      </div>

      {/* Hidden File Picker Inputs */}
      <input ref={idFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleIdFileSelect} />
      <input ref={selfieFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSelfieFileSelect} />

      {/* Current Status Box */}
      {verification && (
        <Card className="border-l-4 border-l-amber-500 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" /> Verification Status
            </h3>
            {verification.status === 'APPROVED' && <Badge variant="verified">APPROVED & VIP ACTIVE</Badge>}
            {verification.status === 'PENDING' && <Badge variant="pending">UNDER ADMIN REVIEW</Badge>}
            {verification.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
          </div>

          {verification.status === 'APPROVED' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Congratulations! Your identity has been verified by security administration. Your Gold VIP badge is active.</span>
            </div>
          )}

          {verification.status === 'PENDING' && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Your document submission is currently under review by our administration team. Review takes 1-2 hours.</span>
            </div>
          )}

          {verification.status === 'REJECTED' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <XCircle className="w-4 h-4" /> Verification Rejected
              </div>
              <p>Reason: {verification.rejectionReason || 'Document photo was blurry or unreadable. Please re-upload.'}</p>
            </div>
          )}
        </Card>
      )}

      {/* Submission Form */}
      {(!verification || verification.status === 'REJECTED') && (
        <Card className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">Identity Submission Form</h3>
            <p className="text-xs text-slate-400">Please upload clear legal document credentials for verification.</p>
          </div>

          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">{error}</div>}
          {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Document ID Type"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                options={[
                  { label: 'Passport', value: 'Passport' },
                  { label: 'National ID / Aadhaar', value: 'National ID' },
                  { label: 'Driving License', value: 'Driving License' },
                ]}
              />
              <Input
                label="ID Document Number"
                name="idNumber"
                placeholder="P89218201"
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* ID Document Photo Picker Card */}
            <div className="p-4 bg-brand-card border border-brand-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={formData.idDocumentUrl}
                  alt="ID Document Preview"
                  className="w-20 h-16 rounded-xl object-cover border border-brand-border shadow-md shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" /> ID Document Photo (Front)
                  </h4>
                  <p className="text-[11px] text-slate-400">Clear photo of Passport, National ID, or Driving License</p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => idFileInputRef.current?.click()}
              >
                Upload ID Photo
              </Button>
            </div>

            {/* Verification Selfie Photo Picker Card */}
            <div className="p-4 bg-brand-card border border-brand-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={formData.selfieUrl}
                  alt="Selfie Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-brand-border shadow-md shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-brand-wine" /> Verification Selfie Photo
                  </h4>
                  <p className="text-[11px] text-slate-400">Selfie photo holding your ID document clearly</p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => selfieFileInputRef.current?.click()}
              >
                Upload Selfie Photo
              </Button>
            </div>

            <Button type="submit" variant="gold" className="w-full" isLoading={loading} leftIcon={<Upload className="w-4 h-4" />}>
              Submit Verification Documents
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
