import express from 'express';
import {
  getKasLogs,
  createKasLog,
  updateKasLog,
  deleteKasLog,
  getKasStats
} from '../controllers/kasController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getKasLogs);
router.post('/', protect, createKasLog);
router.put('/:id', protect, updateKasLog);
router.delete('/:id', protect, deleteKasLog);

router.get('/stats', getKasStats);

export default router;
