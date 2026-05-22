import { Router } from 'express';
import * as authController from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticate, authController.getProfile);
router.patch('/me', authenticate, authController.updateProfile);
router.patch('/change-password', authenticate, authController.changePassword);

export default router;