import { Router } from 'express';
import { SystemSettingsController } from '../controllers/systemSettings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', SystemSettingsController.getSettings);
router.put('/', authenticate, SystemSettingsController.updateSettings);

export default router;
