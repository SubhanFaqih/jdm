import express from 'express';
import {
  getProfile,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  toggleActiveProfile
} from '../controllers/profileMasjidController.js';

import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProfile);
router.get('/:id', getProfileById);
router.post('/', upload.single('logo_url'), createProfile);
router.put('/:id', upload.single('logo_url'), updateProfile);
router.patch('/:id/toggle-active', toggleActiveProfile);
router.delete('/:id', deleteProfile);

export default router;
