import { Router } from 'express';
import {
    signup,
    login,
    logout,
    getCurrentUser,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/global-rate-limit.js';
import { validateBody } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../schemas/authSchemas.js';

const router = Router();

router.post('/signup', authRateLimit, validateBody(signupSchema), signup);
router.post('/login', authRateLimit, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
