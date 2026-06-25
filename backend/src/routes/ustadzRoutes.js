import express from 'express';
import {
  getUstadzList,
  getUstadzById,
  createUstadz,
  updateUstadz,
  deleteUstadz
} from '../controllers/ustadzController.js';

import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// GET all preachers
router.get('/', getUstadzList);

// GET preacher by ID
router.get('/:id', getUstadzById);

// POST create preacher
router.post('/', upload.single('foto_url'), createUstadz);

// PUT update preacher by ID
router.put('/:id', upload.single('foto_url'), updateUstadz);

// DELETE preacher by ID
router.delete('/:id', deleteUstadz);

export default router;
