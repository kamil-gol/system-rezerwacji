import { Router } from 'express';
import * as controller from '../controllers/backup.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/create', controller.createBackup);
router.get('/list', controller.listBackups);
router.post('/restore/:id', controller.restoreBackup);

export default router;
