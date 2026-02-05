import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/logs', adminController.getLogs);

export default router;
