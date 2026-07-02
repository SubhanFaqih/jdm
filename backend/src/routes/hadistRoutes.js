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
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to get 1 random hadith from local DB
router.get("/", getDailyHadist);

// Route to sync 20 random hadiths for a theme from external API to local DB
router.post("/sync", protect, syncExternalHadist);

// Routes to manage hadith themes
router.get("/themes", protect, getThemes);
router.get("/themes/:id", protect, getThemeById);
router.post("/themes", protect, createTheme);
router.put("/themes/:id", protect, updateTheme);
router.delete("/themes/:id", protect, deleteTheme);

export default router;
