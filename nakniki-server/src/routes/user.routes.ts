import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateUser } from '../middleware/authMiddleware';
import { uploadAvatar } from '../middleware/uploadMiddleware';

const router = Router();

router.get('/leaderboard', authenticateUser, UserController.getLeaderboard);
router.get('/search', authenticateUser, UserController.searchUser);
router.get('/profile', authenticateUser, UserController.getUser);
router.put('/update', authenticateUser, uploadAvatar, UserController.updateUser);

export default router;