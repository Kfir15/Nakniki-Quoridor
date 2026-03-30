const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
import { uploadAvatar } from '../middleware/uploadMiddleware';

router.post('/signup', uploadAvatar, AuthController.signUp);
router.post('/signin', AuthController.signIn);

module.exports = router;