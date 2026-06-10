import { Router } from 'express';
import { TournamentController } from '../controllers/TournamentController';
import { ROUTE_CONSTANTS as R } from '@nakniki/shared';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.get(R.TOURNAMENTS.LIST, authenticateUser, TournamentController.listOpenTournaments);
router.post(R.TOURNAMENTS.CREATE, authenticateUser, TournamentController.createTournament);
router.get(R.TOURNAMENTS.DETAILS, authenticateUser, TournamentController.getTournamentDetails);
router.post(R.TOURNAMENTS.JOIN, authenticateUser, TournamentController.joinTournament);

export default router;