import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { systemSettingsService, SystemSettingsData } from '../services/systemSettings.service';
import { useAuth } from './AuthContext';
import { Wrench, RefreshCw } from 'lucide-react';

import { getTranslation, SupportedLanguage } from '../utils/translations';

interface SystemSettingsContextType {
  settings: SystemSettingsData;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  t: (key: string) => string;
}

const defaultSettings: SystemSettingsData = {
  appName: 'Wink Me Club',
  defaultCurrency: 'INR',
  currencySymbol: '₹',
  projectImage: '',
  maintenanceMode: false,
  supportEmail: 'support@winkmeclub.com',
  defaultLanguage: 'English',
  telegramFinanceLink: 'https://t.me/winkmedatingclub_finance',
  telegramSupportLink: 'https://t.me/winkmedatingclub_support',
};

const SystemSettingsContext = createContext<SystemSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  t: (key: string) => key,
});

export const SystemSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = async () => {
    try {
      const res = await systemSettingsService.getSettings();
      if (res.data.success && res.data.settings) {
        const loaded = { ...res.data.settings };
        if (loaded.defaultCurrency === 'EUR') loaded.currencySymbol = '€';
        else if (loaded.defaultCurrency === 'USD') loaded.currencySymbol = '$';
        else if (loaded.defaultCurrency === 'PKR') loaded.currencySymbol = 'Rs.';
        else if (loaded.defaultCurrency === 'GBP') loaded.currencySymbol = '£';
        else if (loaded.defaultCurrency === 'INR') loaded.currencySymbol = '₹';

        setSettings(loaded);
        if (loaded.appName) {
          document.title = loaded.appName;
        }
      }
    } catch (err) {
      console.error('Failed to load system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Global Maintenance Mode Guard for non-admin users
  const isMaintenanceActive = settings.maintenanceMode && user?.role === 'USER';

  if (isMaintenanceActive) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center space-y-6 text-slate-100">
        <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-3xl shadow-2xl space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <Wrench className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-slate-100">
            {settings.appName || 'Wink Me Club'} System Maintenance
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            We are currently performing scheduled platform upgrades to enhance performance and security. All user operations are temporarily paused.
          </p>

          <div className="pt-2 border-t border-amber-500/20 text-[11px] text-slate-400">
            Support Email: <span className="text-amber-400 font-bold">{settings.supportEmail || 'support@winkmeclub.com'}</span>
          </div>

          <button
            onClick={() => fetchSettings()}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/40 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </button>
        </div>
      </div>
    );
  }

  const t = (key: string) => getTranslation((settings.defaultLanguage as SupportedLanguage) || 'English', key);

  return (
    <SystemSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, t }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => useContext(SystemSettingsContext);
