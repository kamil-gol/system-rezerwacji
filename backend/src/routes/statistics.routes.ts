import { Router } from 'express';
import * as controller from '../controllers/statistics.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/overview', controller.getOverview);
router.get('/revenue', controller.getRevenue);
router.get('/popular-events', controller.getPopularEvents);
router.get('/room-utilization', controller.getRoomUtilization);
router.get('/customer-stats', controller.getCustomerStats);

export default router;
