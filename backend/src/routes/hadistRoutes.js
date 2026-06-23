import express from 'express';
import { 
  getDailyHadist, 
  syncExternalHadist,
  getThemes,
  saveThemes
} from '../controllers/hadistController.js';

const router = express.Router();

// Route to get 1 random hadith from local DB
router.get("/", getDailyHadist);

// Route to sync 20 random hadiths for a theme from external API to local DB
router.post("/sync", syncExternalHadist);

// Routes to get/save configurable hadith themes from frontend
router.get("/themes", getThemes);
router.post("/themes", saveThemes);

export default router;