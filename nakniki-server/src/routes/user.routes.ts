const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateUser } = require('../middleware/authMiddleware');
import { uploadAvatar } from '../middleware/uploadMiddleware';

router.get('/leaderboard', authenticateUser, UserController.getLeaderboard);
router.get('/search', authenticateUser, UserController.searchUser);
router.get('/profile', authenticateUser, UserController.getUser);
router.put('/update', authenticateUser, uploadAvatar, UserController.updateUser);

module.exports = router;