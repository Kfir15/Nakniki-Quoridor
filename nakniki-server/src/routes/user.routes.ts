import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateUser } from '../middleware/authMiddleware';
import { uploadAvatar } from '../middleware/uploadMiddleware';
import { ROUTE_CONSTANTS as R } from '../constants/route.constants';

const router = Router();

router.get(R.USERS.LEADERBOARD, authenticateUser, UserController.getLeaderboard);
router.get(R.USERS.SEARCH, authenticateUser, UserController.searchUser);
router.get(R.USERS.PROFILE, authenticateUser, UserController.getUser);
router.put(R.USERS.UPDATE, authenticateUser, uploadAvatar, UserController.updateUser);

export default router;