import { Router } from 'express';
import { TradeController } from '../controllers/trade.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { tradeSchema } from '../validators/trade.validator';

const router = Router();

router.post('/', authenticate, validateRequest(tradeSchema), TradeController.executeTrade);
router.get('/', authenticate, TradeController.getMyTrades);

export default router;
