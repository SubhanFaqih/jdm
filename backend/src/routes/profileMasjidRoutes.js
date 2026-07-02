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
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET active profile (public)
router.get('/', getProfile);

// GET profile by ID (admin-only)
router.get('/:id', protect, getProfileById);

// POST create profile (admin-only)
router.post('/', protect, upload.single('logo_url'), createProfile);

// PUT update profile (admin-only)
router.put('/:id', protect, upload.single('logo_url'), updateProfile);

// PATCH toggle active profile (admin-only)
router.patch('/:id/toggle-active', protect, toggleActiveProfile);

// DELETE profile (admin-only)
router.delete('/:id', protect, deleteProfile);

export default router;
