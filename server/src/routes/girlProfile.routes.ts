import { Router } from 'express';
import { GirlProfileController } from '../controllers/girlProfile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes for user discovery & matches
router.get('/public', GirlProfileController.getPublicProfiles);
router.get('/categories', GirlProfileController.getCategories);
router.get('/:id', GirlProfileController.getProfileById);

// Admin / Staff protected CRUD routes
router.get('/admin/all', authenticate, GirlProfileController.getAllProfilesAdmin);
router.post('/admin/create', authenticate, GirlProfileController.createProfile);
router.put('/admin/update/:id', authenticate, GirlProfileController.updateProfile);
router.delete('/admin/delete/:id', authenticate, GirlProfileController.deleteProfile);
router.post('/admin/categories', authenticate, GirlProfileController.createCategory);

export default router;
