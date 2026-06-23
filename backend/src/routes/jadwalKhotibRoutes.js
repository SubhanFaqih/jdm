import express from 'express';
import {
  getJadwalKhotibList,
  getJadwalKhotibById,
  createJadwalKhotib,
  updateJadwalKhotib,
  deleteJadwalKhotib
} from '../controllers/jadwalKhotibController.js';

const router = express.Router();

// GET all schedules
router.get('/', getJadwalKhotibList);

// GET schedule by ID
router.get('/:id', getJadwalKhotibById);

// POST create schedule assignment
router.post('/', createJadwalKhotib);

// PUT update schedule by ID
router.put('/:id', updateJadwalKhotib);

// DELETE schedule by ID
router.delete('/:id', deleteJadwalKhotib);

export default router;
