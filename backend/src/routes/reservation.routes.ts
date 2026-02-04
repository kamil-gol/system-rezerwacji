import { Router } from 'express';
import * as controller from '../controllers/reservation.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { reservationSchema } from '../utils/validators';
import multer from 'multer';
import path from 'path';

const router = Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Niedozwolony typ pliku'));
  }
});

router.use(authenticate);

router.get('/', controller.getReservations);
router.get('/upcoming', controller.getUpcomingReservations);
router.get('/archive', controller.getArchivedReservations);
router.get('/:id', controller.getReservationById);
router.post('/', validate(reservationSchema), controller.createReservation);
router.put('/:id', controller.updateReservation);
router.delete('/:id', controller.cancelReservation);
router.get('/:id/pdf', controller.generatePDF);
router.post('/:id/send-email', controller.sendReservationEmail);
router.get('/:id/history', controller.getReservationHistory);
router.post('/:id/attachments', upload.array('files', 5), controller.uploadAttachments);

export default router;
