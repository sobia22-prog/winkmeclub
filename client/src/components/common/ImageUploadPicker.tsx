import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  showActionButtons?: boolean;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  value,
  onChange,
  label = 'Image File Upload',
  helperText = 'Select an image file from your device',
  aspectRatio = 'banner',
  showActionButtons = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Selected image file exceeds 5MB size limit.');
        return;
      }
      setErrorMsg('');
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAspectClass = () => {
    if (aspectRatio === 'square') return 'h-32 w-32';
    if (aspectRatio === 'video') return 'h-40 w-full';
    return 'h-36 w-full';
  };

  return (
    <div className="space-y-1.5 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {showActionButtons ? (
        <div className="p-5 bg-brand-dark/70 border border-brand-border rounded-2xl space-y-3 shadow-inner">
          {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}

          <div className="flex flex-wrap items-center gap-4">
            {/* Image Thumbnail Preview */}
            {value ? (
              <div className="relative group">
                <img
                  src={value}
                  alt="Logo Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
                />
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center text-amber-400 shadow-md">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}

            {/* Explicit Action Buttons (Upload Image & Remove) */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload Image
              </Button>

              {value && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onChange('')}
                  className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
        </div>
      ) : (
        <>
          {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}

          {value ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative ${getAspectClass()} rounded-2xl overflow-hidden border border-brand-border group cursor-pointer shadow-md bg-brand-surface`}
            >
              <img src={value} alt="Uploaded Preview" className="w-full h-full object-cover" />

              {/* Centered Camera Icon Overlay in Edit Mode */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                <div className="p-3 bg-brand-wine/80 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-bold">Change Image</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 rounded-full text-white transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`${getAspectClass()} rounded-2xl border-2 border-dashed border-brand-border hover:border-brand-wine bg-brand-card/50 hover:bg-brand-card flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-slate-400 hover:text-slate-100 group`}
            >
              <div className="p-3 bg-brand-surface border border-brand-border rounded-full group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold block text-slate-200">Click to Upload Image</span>
                <span className="text-[10px] text-slate-500">{helperText}</span>
              </div>
            </div>
          )}
        </>
      )}

      {errorMsg && <p className="text-[11px] text-rose-400 font-semibold">{errorMsg}</p>}
    </div>
  );
};
