import { Router } from 'express';
import * as controller from '../controllers/room.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', controller.getRooms);
router.get('/:id', controller.getRoomById);
router.get('/:id/availability', controller.checkRoomAvailability);
router.post('/', authorize('ADMIN'), controller.createRoom);
router.put('/:id', authorize('ADMIN'), controller.updateRoom);

export default router;
