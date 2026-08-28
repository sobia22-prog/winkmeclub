import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  amount?: number;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'gold' | 'primary';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  amount,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const { settings } = useSystemSettings();
  const currencySymbol = settings.currencySymbol || '₹';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-pink-50/50 border border-pink-100 rounded-2xl">
          <AlertTriangle className="w-6 h-6 text-pink-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-800 font-medium">{message}</p>
            {amount !== undefined && (
              <div className="mt-2 text-lg font-extrabold text-pink-600">
                Amount: {currencySymbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
