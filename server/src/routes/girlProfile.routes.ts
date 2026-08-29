import { Router } from 'express';
import { GirlProfileController } from '../controllers/girlProfile.controller';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes for user discovery & matches
router.get('/public', GirlProfileController.getPublicProfiles);
router.get('/categories', GirlProfileController.getCategories);
router.get('/:id', GirlProfileController.getProfileById);

// Admin-only protected CRUD routes (Staff restricted)
router.get('/admin/all', authenticate, requireSuperAdmin, GirlProfileController.getAllProfilesAdmin);
router.post('/admin/create', authenticate, requireSuperAdmin, GirlProfileController.createProfile);
router.put('/admin/update/:id', authenticate, requireSuperAdmin, GirlProfileController.updateProfile);
router.delete('/admin/delete/:id', authenticate, requireSuperAdmin, GirlProfileController.deleteProfile);
router.post('/admin/categories', authenticate, requireSuperAdmin, GirlProfileController.createCategory);

export default router;
