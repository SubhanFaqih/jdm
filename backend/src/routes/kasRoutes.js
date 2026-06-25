import express from 'express';
import {
  getKasLogs,
  createKasLog,
  updateKasLog,
  deleteKasLog,
  getKasStats
} from '../controllers/kasController.js';

const router = express.Router();

router.get('/', getKasLogs);
router.post('/', createKasLog);
router.put('/:id', updateKasLog);
router.delete('/:id', deleteKasLog);

router.get('/stats', getKasStats);

export default router;
