import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, X } from 'lucide-react';
import { brandConfig } from '../../config/brand.config';

interface MultiSelectCityProps {
  selectedCities: string[];
  onChange: (cities: string[]) => void;
  label?: string;
}

export const MultiSelectCity: React.FC<MultiSelectCityProps> = ({
  selectedCities,
  onChange,
  label = 'Target Cities',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allCities = brandConfig.cities;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = selectedCities.length === 0 || selectedCities.includes('All');

  const toggleCity = (city: string) => {
    if (city === 'All') {
      onChange([]);
      return;
    }

    let updated: string[];
    if (selectedCities.includes(city)) {
      updated = selectedCities.filter((c) => c !== city && c !== 'All');
    } else {
      updated = [...selectedCities.filter((c) => c !== 'All'), city];
    }
    onChange(updated);
  };

  const getDisplayText = () => {
    if (isAllSelected || selectedCities.length === 0) {
      return 'All Cities';
    }
    if (selectedCities.length === 1) {
      return selectedCities[0];
    }
    return `${selectedCities[0]} (+${selectedCities.length - 1} more)`;
  };

  return (
    <div className="w-full space-y-1.5 relative" ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-pink-500"
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-pink-600 shrink-0" />
          <span className="font-bold truncate">{getDisplayText()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected Cities Badges Preview */}
      {!isAllSelected && selectedCities.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-1">
          {selectedCities.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-50 border border-pink-200 text-pink-600 text-[10px] font-bold rounded-md"
            >
              {c}
              <button
                type="button"
                onClick={() => toggleCity(c)}
                className="hover:text-slate-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] text-slate-500 hover:text-slate-700 underline font-semibold ml-1"
          >
            Reset
          </button>
        </div>
      )}

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div
            onClick={() => toggleCity('All')}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              isAllSelected ? 'bg-pink-50 text-pink-600 font-extrabold' : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> All Cities
            </span>
            {isAllSelected && <Check className="w-4 h-4 text-pink-600" />}
          </div>

          <div className="h-px bg-slate-100 my-1" />

          {allCities.map((c) => {
            const isSelected = selectedCities.includes(c);
            return (
              <div
                key={c}
                onClick={() => toggleCity(c)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  isSelected ? 'bg-pink-50 text-pink-600 font-extrabold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{c}</span>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-pink-600 border-pink-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
