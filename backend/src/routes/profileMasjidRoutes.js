import express from 'express';
import {
  getProfile,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile
} from '../controllers/profileMasjidController.js';

const router = express.Router();

router.get('/', getProfile);
router.get('/:id', getProfileById);
router.post('/', createProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

export default router;
