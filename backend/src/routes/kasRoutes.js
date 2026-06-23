import express from 'express';
import {
  getKasLogs,
  createKasLog,
  getKasStats
} from '../controllers/kasController.js';

const router = express.Router();

// GET history of cash transactions
router.get('/', getKasLogs);

// POST register a new cash transaction
router.post('/', createKasLog);

// GET financial statistics (saldo, monthly sums)
router.get('/stats', getKasStats);

// NOTE: PUT and DELETE routes are deliberately excluded to ensure financial audit integrity.
// Any corrections must be registered as new adjustment transactions (reversal logs).

export default router;
