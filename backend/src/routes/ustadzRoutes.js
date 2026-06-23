import express from 'express';
import {
  getUstadzList,
  getUstadzById,
  createUstadz,
  updateUstadz,
  deleteUstadz
} from '../controllers/ustadzController.js';

const router = express.Router();

// GET all preachers
router.get('/', getUstadzList);

// GET preacher by ID
router.get('/:id', getUstadzById);

// POST create preacher
router.post('/', createUstadz);

// PUT update preacher by ID
router.put('/:id', updateUstadz);

// DELETE preacher by ID
router.delete('/:id', deleteUstadz);

export default router;
