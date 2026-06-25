import express from "express";
import {
  getDailyHadist,
  syncExternalHadist,
  getThemes,
  getThemeById,
  createTheme,
  updateTheme,
  deleteTheme,
} from "../controllers/hadistController.js";

const router = express.Router();

// Route to get 1 random hadith from local DB
router.get("/", getDailyHadist);

// Route to sync 20 random hadiths for a theme from external API to local DB
router.post("/sync", syncExternalHadist);

// Routes to manage hadith themes
router.get("/themes", getThemes);
router.get("/themes/:id", getThemeById);
router.post("/themes", createTheme);
router.put("/themes/:id", updateTheme);
router.delete("/themes/:id", deleteTheme);

export default router;
