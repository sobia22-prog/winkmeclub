import { Router } from 'express';
import { RechargeController } from '../controllers/recharge.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { rechargeSchema } from '../validators/wallet.validator';

const router = Router();

router.post('/', authenticate, validateRequest(rechargeSchema), RechargeController.submit);
router.get('/', authenticate, RechargeController.getMyRecharges);

export default router;
