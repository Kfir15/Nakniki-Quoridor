const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/leaderboard', authenticateUser, UserController.getLeaderboard);
router.get('/search', authenticateUser, UserController.searchUser);
router.get('/me', authenticateUser, UserController.getUser);
router.put('/update', authenticateUser, UserController.updateUser);

module.exports = router;