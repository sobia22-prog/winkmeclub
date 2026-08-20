import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  value,
  onChange,
  label = 'Image File Upload',
  helperText = 'Select an image file from your device',
  aspectRatio = 'banner',
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
      {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
      {errorMsg && <p className="text-[11px] text-rose-400 font-semibold">{errorMsg}</p>}
    </div>
  );
};
