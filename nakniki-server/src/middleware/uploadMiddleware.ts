import multer from 'multer';
import { UPLOAD_CONSTANTS as U } from '../constants/upload.constants';

const storage = multer.memoryStorage();

export const uploadAvatar = multer({
    storage: storage,
    limits: { fileSize: U.MAX_AVATAR_SIZE_BYTES }
}).single('avatar');