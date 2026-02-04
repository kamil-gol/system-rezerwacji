import { Router } from 'express';
import * as controller from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { customerSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', controller.getCustomers);
router.get('/:id', controller.getCustomerById);
router.post('/', validate(customerSchema), controller.createCustomer);
router.put('/:id', validate(customerSchema), controller.updateCustomer);
router.get('/:id/reservations', controller.getCustomerReservations);

export default router;
