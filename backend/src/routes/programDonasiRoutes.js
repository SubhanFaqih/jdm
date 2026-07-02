import express from 'express';
import {
  getProgramDonasiList,
  getProgramDonasiById,
  createProgramDonasi,
  updateProgramDonasi,
  deleteProgramDonasi,
  toggleActiveDonasi
} from '../controllers/programDonasiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all programs (public)
router.get('/', getProgramDonasiList);

// GET program by ID (admin-only)
router.get('/:id', protect, getProgramDonasiById);

// POST create program (admin-only)
router.post('/', protect, createProgramDonasi);

// PUT update program by ID (admin-only)
router.put('/:id', protect, updateProgramDonasi);

// PATCH toggle active (admin-only)
router.patch('/:id/toggle-active', protect, toggleActiveDonasi);

// DELETE program by ID (admin-only)
router.delete('/:id', protect, deleteProgramDonasi);

export default router;
