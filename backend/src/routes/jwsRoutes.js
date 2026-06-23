import express from 'express';
import { syncExternalSchedule, getDailySchedule } from '../controllers/jwsController.js';

const router = express.Router();

// Route to get a daily prayer schedule
router.get('/', getDailySchedule);

// Route to sync monthly prayer schedule from external API to DB
router.post('/sync', syncExternalSchedule);

export default router;
