import { Router } from 'express';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { withdrawalSchema } from '../validators/wallet.validator';

const router = Router();

router.post('/', authenticate, validateRequest(withdrawalSchema), WithdrawalController.submit);
router.get('/', authenticate, WithdrawalController.getMyWithdrawals);

export default router;
