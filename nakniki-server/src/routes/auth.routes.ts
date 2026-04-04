import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { uploadAvatar } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/signup', uploadAvatar, AuthController.signUp);
router.post('/signin', AuthController.signIn);

export default router;