import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/tickets', authenticate, SupportController.createTicket);
router.get('/tickets', authenticate, SupportController.getMyTickets);
router.get('/tickets/:id', authenticate, SupportController.getTicketDetails);
router.post('/tickets/:id/reply', authenticate, SupportController.reply);

export default router;
