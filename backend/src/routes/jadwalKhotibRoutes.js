import express from 'express';
import {
  getJadwalKhotibList,
  getJadwalKhotibById,
  createJadwalKhotib,
  updateJadwalKhotib,
  deleteJadwalKhotib,
  importJadwalKhotib
} from '../controllers/jadwalKhotibController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all schedules (public)
router.get('/', getJadwalKhotibList);

// GET schedule by ID (admin-only)
router.get('/:id', protect, getJadwalKhotibById);

// POST bulk import schedules (admin-only)
router.post('/import', protect, importJadwalKhotib);

// POST create schedule assignment (admin-only)
router.post('/', protect, createJadwalKhotib);

// PUT update schedule by ID (admin-only)
router.put('/:id', protect, updateJadwalKhotib);

// DELETE schedule by ID (admin-only)
router.delete('/:id', protect, deleteJadwalKhotib);

export default router;
