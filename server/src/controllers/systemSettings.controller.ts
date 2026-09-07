import { Request, Response } from 'express';
import { SystemSettings } from '../models/systemSettings.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { getCache, setCache, invalidateCache } from '../utils/cache';

export class SystemSettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      const cached = getCache<{ settings: unknown }>('system-settings');
      if (cached) {
        res.set('Cache-Control', 'public, max-age=120');
        return res.status(200).json({ success: true, ...cached });
      }

      const existing = await SystemSettings.findOne().lean();
      const settingsDoc = existing ?? (await SystemSettings.create({})).toObject();

      const settings = { ...settingsDoc };
      if (settings.defaultCurrency === 'EUR') settings.currencySymbol = '€';
      else if (settings.defaultCurrency === 'USD') settings.currencySymbol = '$';
      else if (settings.defaultCurrency === 'PKR') settings.currencySymbol = 'Rs.';
      else if (settings.defaultCurrency === 'GBP') settings.currencySymbol = '£';
      else if (settings.defaultCurrency === 'INR') settings.currencySymbol = '₹';

      const payload = { settings };
      setCache('system-settings', payload, 120_000);

      res.set('Cache-Control', 'public, max-age=120');
      return res.status(200).json({ success: true, ...payload });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch settings.' });
    }
  }

  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF')) {
        return res.status(403).json({ message: 'Unauthorized. Admin or Staff access required.' });
      }

      const {
        appName,
        defaultCurrency,
        projectImage,
        maintenanceMode,
        supportEmail,
        defaultLanguage,
        telegramFinanceLink,
        telegramSupportLink,
        telegramSupportQrCode,
        telegramSupportMessage,
        usdtWalletAddress,
        usdtExchangeRate,
        adminUpiId,
        bankName,
        accountHolder,
        accountNumber,
        ifscCode,
      } = req.body;

      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = new SystemSettings({});
      }

      if (appName !== undefined) settings.appName = appName;
      if (defaultCurrency !== undefined) {
        settings.defaultCurrency = defaultCurrency;
        if (defaultCurrency === 'EUR') settings.currencySymbol = '€';
        else if (defaultCurrency === 'USD') settings.currencySymbol = '$';
        else if (defaultCurrency === 'PKR') settings.currencySymbol = 'Rs.';
        else if (defaultCurrency === 'GBP') settings.currencySymbol = '£';
        else if (defaultCurrency === 'INR') settings.currencySymbol = '₹';
        else settings.currencySymbol = defaultCurrency;
      }
      if (req.body.currencySymbol !== undefined) {
        settings.currencySymbol = req.body.currencySymbol;
      }
      if (projectImage !== undefined) settings.projectImage = projectImage;
      if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);
      if (supportEmail !== undefined) settings.supportEmail = supportEmail;
      if (defaultLanguage !== undefined) settings.defaultLanguage = defaultLanguage;

      if (telegramFinanceLink !== undefined) settings.telegramFinanceLink = telegramFinanceLink;
      if (telegramSupportLink !== undefined) settings.telegramSupportLink = telegramSupportLink;
      if (telegramSupportQrCode !== undefined) settings.telegramSupportQrCode = telegramSupportQrCode;
      if (telegramSupportMessage !== undefined) settings.telegramSupportMessage = telegramSupportMessage;
      if (usdtWalletAddress !== undefined) settings.usdtWalletAddress = usdtWalletAddress;
      if (usdtExchangeRate !== undefined && !isNaN(Number(usdtExchangeRate))) {
        settings.usdtExchangeRate = Number(usdtExchangeRate);
      }
      if (adminUpiId !== undefined) settings.adminUpiId = adminUpiId;
      if (bankName !== undefined) settings.bankName = bankName;
      if (accountHolder !== undefined) settings.accountHolder = accountHolder;
      if (accountNumber !== undefined) settings.accountNumber = accountNumber;
      if (ifscCode !== undefined) settings.ifscCode = ifscCode;

      await settings.save();

      invalidateCache('system-settings');

      return res.status(200).json({
        success: true,
        message: 'System general & payment settings updated successfully!',
        settings,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to update settings.' });
    }
  }
}
