import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, otpSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/verify-otp', validateRequest(otpSchema), AuthController.verifyOTP);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/admin-login', validateRequest(loginSchema), AuthController.adminLogin);
router.post('/staff-login', validateRequest(loginSchema), AuthController.staffLogin);
router.get('/me', authenticate, AuthController.getMe);

export default router;
