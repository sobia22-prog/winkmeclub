import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/matches', authenticate, ProfileController.getMatches);
router.get('/:id', authenticate, ProfileController.getProfileById);

export default router;
