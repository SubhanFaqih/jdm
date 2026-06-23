import express from 'express';
import {
  getProgramDonasiList,
  getProgramDonasiById,
  createProgramDonasi,
  updateProgramDonasi,
  deleteProgramDonasi
} from '../controllers/programDonasiController.js';

const router = express.Router();

// GET all programs
router.get('/', getProgramDonasiList);

// GET program by ID
router.get('/:id', getProgramDonasiById);

// POST create program
router.post('/', createProgramDonasi);

// PUT update program by ID
router.put('/:id', updateProgramDonasi);

// DELETE program by ID
router.delete('/:id', deleteProgramDonasi);

export default router;
