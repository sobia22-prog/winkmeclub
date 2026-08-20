import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import profileRoutes from './profile.routes';
import dateRequestRoutes from './dateRequest.routes';
import verificationRoutes from './verification.routes';
import walletRoutes from './wallet.routes';
import rechargeRoutes from './recharge.routes';
import withdrawalRoutes from './withdrawal.routes';
import productRoutes from './product.routes';
import tradeRoutes from './trade.routes';
import notificationRoutes from './notification.routes';
import supportRoutes from './support.routes';
import announcementRoutes from './announcement.routes';
import systemSettingsRoutes from './systemSettings.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/date-requests', dateRequestRoutes);
router.use('/verifications', verificationRoutes);
router.use('/wallet', walletRoutes);
router.use('/recharges', rechargeRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/products', productRoutes);
router.use('/trades', tradeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support', supportRoutes);
router.use('/announcements', announcementRoutes);
router.use('/system-settings', systemSettingsRoutes);
router.use('/admin', adminRoutes);

export default router;
