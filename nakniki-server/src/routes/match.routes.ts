import { Router } from 'express';
import { MatchController } from '../controllers/MatchController';
import { authenticateUser } from '../middleware/authMiddleware';
import { ROUTE_CONSTANTS as R } from '@nakniki/shared';

const router = Router();

router.get(R.MATCHES.HISTORY, authenticateUser, MatchController.getMatchHistory);
router.get(R.MATCHES.DETAILS, authenticateUser, MatchController.getMatchDetails)

export default router;