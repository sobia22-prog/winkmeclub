import { Router } from 'express';
import { DateRequestController } from '../controllers/dateRequest.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, DateRequestController.create);
router.get('/', authenticate, DateRequestController.getMyRequests);

export default router;
