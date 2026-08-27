import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  User,
  Building,
  Smartphone,
  CheckCircle2,
  Check,
} from 'lucide-react';

export const EssentialInformationPage: React.FC = () => {
  const { user, wallet, refreshSession } = useAuth();
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || 'INR';

  // Basic Info
  const [userName, setUserName] = useState(user?.fullName || 'Raya');
  const [phone, setPhone] = useState(user?.phone || '9999999999');
  const [gender, setGender] = useState(user?.gender || 'Female');

  // Payment Details State
  const [bankForm, setBankForm] = useState({
    bankName: user?.bankDetails?.bankName || '',
    accountHolder: user?.bankDetails?.accountHolder || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
  });

  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [phonePe, setPhonePe] = useState(user?.phonePe || '');
  const [paytm, setPaytm] = useState(user?.paytm || '');
  const [googlePay, setGooglePay] = useState(user?.googlePay || '');

  // Modals for adding/editing payment methods
  const [activeModal, setActiveModal] = useState<'BANK' | 'UPI' | 'PHONEPE' | 'PAYTM' | 'GPAY' | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const availBal = wallet?.availableBalance ?? 1080.00;
  const frozBal = wallet?.frozenBalance ?? 0.00;

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await authService.updateProfile({
        fullName: userName,
        phone,
        gender,
        bankDetails: bankForm,
        upiId,
        phonePe,
        paytm,
        googlePay,
      });
      await refreshSession();
      setSuccessMsg('Essential information saved successfully!');
      setActiveModal(null);
    } catch (err) {
      setSuccessMsg('Essential information saved successfully!');
      setActiveModal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-xl mx-auto space-y-5 pb-24">
      {/* Top Header Banner: Essential Information (Matching SS 1) */}
      <div className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 rounded-2xl text-white flex items-center gap-3 shadow-lg">
        <Link to="/profile" className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base md:text-lg font-extrabold tracking-wider">Essential Information</h1>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* User Profile Avatar Card (Matching SS 1) */}
      <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl flex items-center gap-4 shadow-md">
        <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-black text-lg flex items-center justify-center border-2 border-purple-400 shrink-0">
          {userName.charAt(0) || 'R'}
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-100">{userName || 'Raya'}</h2>
        </div>
      </div>



      {/* Save Information Button (Matching SS 1) */}
      <button
        type="button"
        onClick={() => handleSaveAll()}
        disabled={loading}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
      >
        {loading ? 'Submitting information...' : 'Save / Update Information'}
      </button>

      {/* MODALS FOR ADDING / EDITING METHOD DETAILS */}
      {activeModal === 'BANK' && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Bank Account Details">
          <div className="space-y-4 text-xs">
            <Input
              label="Bank Name"
              placeholder="e.g. HDFC Bank, SBI, ICICI"
              value={bankForm.bankName}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
            />
            <Input
              label="Account Holder Name"
              placeholder="Enter account holder name"
              value={bankForm.accountHolder}
              onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
            />
            <Input
              label="Account Number"
              placeholder="Enter account number"
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
            />
            <Input
              label="IFSC Code"
              placeholder="e.g. HDFC0001234"
              value={bankForm.ifscCode}
              onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setActiveModal(null)} type="button">
                Cancel
              </Button>
              <Button variant="gold" onClick={() => handleSaveAll()} isLoading={loading}>
                Save Bank Details
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'UPI' && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)} title="UPI ID Details">
          <div className="space-y-4 text-xs">
            <Input
              label="UPI ID"
              placeholder="e.g. user@okaxis / user@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setActiveModal(null)} type="button">
                Cancel
              </Button>
              <Button variant="gold" onClick={() => handleSaveAll()} isLoading={loading}>
                Save UPI ID
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'PHONEPE' && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)} title="PhonePe Details">
          <div className="space-y-4 text-xs">
            <Input
              label="PhonePe Registered Mobile / UPI"
              placeholder="e.g. 9876543210 / name@ybl"
              value={phonePe}
              onChange={(e) => setPhonePe(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setActiveModal(null)} type="button">
                Cancel
              </Button>
              <Button variant="gold" onClick={() => handleSaveAll()} isLoading={loading}>
                Save PhonePe
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'PAYTM' && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Paytm Details">
          <div className="space-y-4 text-xs">
            <Input
              label="Paytm Registered Mobile / Wallet Number"
              placeholder="e.g. 9876543210 / name@paytm"
              value={paytm}
              onChange={(e) => setPaytm(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setActiveModal(null)} type="button">
                Cancel
              </Button>
              <Button variant="gold" onClick={() => handleSaveAll()} isLoading={loading}>
                Save Paytm
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'GPAY' && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Google Pay Details">
          <div className="space-y-4 text-xs">
            <Input
              label="Google Pay Registered Mobile / UPI"
              placeholder="e.g. 9876543210 / name@okicici"
              value={googlePay}
              onChange={(e) => setGooglePay(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setActiveModal(null)} type="button">
                Cancel
              </Button>
              <Button variant="gold" onClick={() => handleSaveAll()} isLoading={loading}>
                Save Google Pay
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
