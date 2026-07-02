import express from 'express';
import { syncExternalSchedule, getDailySchedule } from '../controllers/jwsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to get a daily prayer schedule (public)
router.get('/', getDailySchedule);

// Route to sync monthly prayer schedule from external API to DB (admin-only)
router.post('/sync', protect, syncExternalSchedule);

export default router;
