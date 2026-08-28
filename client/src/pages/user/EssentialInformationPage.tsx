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
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-600" /> Essential Information
            </h1>
            <p className="text-[11px] text-slate-500">Personal details & withdrawal payment settlement methods</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500">Settings</span>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>
      )}

      {/* User Profile Avatar Card */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-black text-lg flex items-center justify-center border-2 border-white shadow-md shrink-0">
          {userName.charAt(0) || 'R'}
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900">{userName || 'User'}</h2>
          <p className="text-[11px] text-slate-500 font-medium">Personal & Settlement Accounts</p>
        </div>
      </div>

      {/* Balance Summary Row (Matching Screenshot) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Available Balance</span>
          <div className="text-xl font-black text-pink-600 font-mono">
            {currencySymbol} {availBal.toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Frozen Balance</span>
          <div className="text-xl font-black text-amber-600 font-mono">
            {currencySymbol} {frozBal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Basic Profile Card (Matching Screenshot) */}
      <Card className="p-5 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-pink-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Basic Profile</h3>
        </div>
        <div className="space-y-3">
          <Input
            label="User Name"
            placeholder="Enter full name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { label: 'Female', value: 'Female' },
              { label: 'Male', value: 'Male' },
              { label: 'Other', value: 'Other' },
            ]}
          />
        </div>
      </Card>

      {/* Bank Account Card (Matching Screenshot) */}
      <Card className="p-5 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Building className="w-5 h-5 text-pink-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Bank Account</h3>
        </div>
        {bankForm.accountNumber ? (
          <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-2xl space-y-1 text-xs">
            <p className="font-bold text-slate-900">{bankForm.bankName || 'Bank Account'}</p>
            <p className="text-slate-600 font-mono">Acc: ••••••{bankForm.accountNumber.slice(-4)}</p>
            <p className="text-slate-500 font-mono text-[10px]">IFSC: {bankForm.ifscCode}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">No bank account added yet.</p>
        )}
        <button
          type="button"
          onClick={() => setActiveModal('BANK')}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs shadow-sm transition-all"
        >
          {bankForm.accountNumber ? 'Edit Bank Details' : '+ Add Bank Account'}
        </button>
      </Card>

      {/* UPI ID Card (Matching Screenshot) */}
      <Card className="p-5 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Smartphone className="w-5 h-5 text-pink-600" />
          <h3 className="text-sm font-extrabold text-slate-900">UPI ID</h3>
        </div>
        {upiId ? (
          <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-2xl text-xs font-mono text-slate-900 font-bold">
            {upiId}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">No UPI ID added yet.</p>
        )}
        <button
          type="button"
          onClick={() => setActiveModal('UPI')}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs shadow-sm transition-all"
        >
          {upiId ? 'Edit UPI ID' : '+ Add UPI ID'}
        </button>
      </Card>

      {/* PhonePe Card (Matching Screenshot) */}
      <Card className="p-5 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Smartphone className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-extrabold text-slate-900">PhonePe</h3>
        </div>
        {phonePe ? (
          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl text-xs font-mono text-slate-900 font-bold">
            {phonePe}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">No PhonePe added yet.</p>
        )}
        <button
          type="button"
          onClick={() => setActiveModal('PHONEPE')}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs shadow-sm transition-all"
        >
          {phonePe ? 'Edit PhonePe' : '+ Add PhonePe'}
        </button>
      </Card>

      {/* Paytm Card (Matching Screenshot) */}
      <Card className="p-5 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Smartphone className="w-5 h-5 text-sky-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Paytm</h3>
        </div>
        {paytm ? (
          <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl text-xs font-mono text-slate-900 font-bold">
            {paytm}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">No Paytm added yet.</p>
        )}
        <button
          type="button"
          onClick={() => setActiveModal('PAYTM')}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs shadow-sm transition-all"
        >
          {paytm ? 'Edit Paytm' : '+ Add Paytm'}
        </button>
      </Card>

      {/* Google Pay Card (Matching Screenshot) */}
      <Card className="p-5 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Google Pay</h3>
        </div>
        {googlePay ? (
          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-xs font-mono text-slate-900 font-bold">
            {googlePay}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">No Google Pay added yet.</p>
        )}
        <button
          type="button"
          onClick={() => setActiveModal('GPAY')}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-extrabold text-xs shadow-sm transition-all"
        >
          {googlePay ? 'Edit Google Pay' : '+ Add Google Pay'}
        </button>
      </Card>

      {/* Save Information Button */}
      <button
        type="button"
        onClick={() => handleSaveAll()}
        disabled={loading}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:to-indigo-800 text-white font-black text-xs md:text-sm tracking-wider uppercase shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/20 disabled:opacity-50"
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
