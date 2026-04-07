import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { uploadAvatar } from '../middleware/uploadMiddleware';
import { ROUTE_CONSTANTS as R } from '../constants/route.constants';

const router = Router();

router.post(R.AUTH.SIGNUP, uploadAvatar, AuthController.signUp);
router.post(R.AUTH.SIGNIN, AuthController.signIn);

export default router;