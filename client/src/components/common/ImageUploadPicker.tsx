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
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-sm">
          {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

          <div className="flex flex-wrap items-center gap-4">
            {/* Image Thumbnail Preview */}
            {value ? (
              <div className="relative group">
                <img
                  src={value}
                  alt="Logo Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-200 shadow-md"
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
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-pink-600 shadow-sm">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}

            {/* Explicit Action Buttons (Upload Image & Remove) */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="primary"
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
                  className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
        </div>
      ) : (
        <>
          {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

          {value ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative ${getAspectClass()} rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer shadow-sm bg-white`}
            >
              <img src={value} alt="Uploaded Preview" className="w-full h-full object-cover" />

              {/* Centered Camera Icon Overlay in Edit Mode */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                <div className="p-3 bg-pink-600 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
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
              className={`${getAspectClass()} rounded-2xl border-2 border-dashed border-slate-200 hover:border-pink-500 bg-white hover:bg-pink-50/40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-slate-500 hover:text-slate-900 group`}
            >
              <div className="p-3 bg-pink-50 border border-pink-100 rounded-full group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold block text-slate-800">Click to Upload Image</span>
                <span className="text-[10px] text-slate-500">{helperText}</span>
              </div>
            </div>
          )}
        </>
      )}

      {errorMsg && <p className="text-[11px] text-rose-500 font-semibold">{errorMsg}</p>}
    </div>
  );
};
