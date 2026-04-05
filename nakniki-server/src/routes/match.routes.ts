import { Router } from 'express';
import { MatchController } from '../controllers/MatchController';
import { authenticateUser } from '../middleware/authMiddleware';
import { ROUTE_CONSTANTS as R } from '../constants/route.constants';

const router = Router();

router.get(R.MATCHES.HISTORY, authenticateUser, MatchController.getMatchHistory);

export default router;