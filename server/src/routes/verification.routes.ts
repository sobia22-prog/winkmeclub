import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, VerificationController.submit);
router.get('/status', authenticate, VerificationController.getStatus);

export default router;
