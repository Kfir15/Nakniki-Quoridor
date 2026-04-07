import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import matchRoutes from './match.routes';
import { ROUTE_CONSTANTS as R } from '../constants/route.constants';

const router = Router();

router.use(R.AUTH.ROOT, authRoutes);
router.use(R.USERS.ROOT, userRoutes);
router.use(R.MATCHES.ROOT, matchRoutes);

export default router;