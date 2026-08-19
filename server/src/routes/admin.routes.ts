import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Protect all admin routes with JWT Auth + Admin Guard
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboardStats);

// Users & Match Profiles Management
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createMatchProfile);
router.get('/users/:id', AdminController.getUserDetail);
router.put('/users/:id', AdminController.updateUserProfile);
router.delete('/users/:id', AdminController.deleteUser);
router.post('/users/:id/balance', AdminController.adjustUserBalance);
router.patch('/users/:id/status', AdminController.toggleUserStatus);

// Recharges
router.get('/recharges', AdminController.getRecharges);
router.post('/recharges/:id/review', AdminController.reviewRecharge);

// Withdrawals
router.get('/withdrawals', AdminController.getWithdrawals);
router.post('/withdrawals/:id/review', AdminController.reviewWithdrawal);

// Trades
router.get('/trades', AdminController.getTrades);
router.post('/trades/:tradeId/settle', AdminController.settleTrade);

// Verifications
router.get('/verifications', AdminController.getVerifications);
router.post('/verifications/:id/review', AdminController.reviewVerification);

// Products
router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Announcements
router.post('/announcements', AdminController.createAnnouncement);
router.delete('/announcements/:id', AdminController.deleteAnnouncement);

// Support
router.get('/tickets', AdminController.getTickets);
router.post('/tickets/:id/reply', AdminController.replyTicket);

// Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
