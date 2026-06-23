import { 
  syncHadistData, 
  getRandomHadistFromDb, 
  checkExistingHadist 
} from "../services/hadistService.js";
import HadistTheme from "../models/HadistTheme.js";

/**
 * POST /api/hadist/sync
 * Sync 20 random hadiths for a chosen keyword/theme from external API to local DB.
 */
export const syncExternalHadist = async (req, res) => {
  try {
    const { keyword, force } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Parameter 'keyword' (tema hadis) wajib disertakan di request body."
      });
    }

    // Check if data already exists, unless 'force' is true
    if (!force) {
      const existing = await checkExistingHadist(keyword);
      if (existing) {
        return res.status(200).json({
          success: true,
          message: `Hadiths for theme "${keyword}" already exist in the database. Sync skipped.`,
          meta: {
            keyword: keyword.trim().toLowerCase(),
            source: 'local'
          }
        });
      }
    }

    console.log(`Syncing hadiths for theme: "${keyword}"...`);
    const result = await syncHadistData(keyword, 20);

    res.status(200).json({
      success: true,
      message: "Hadiths successfully synced with database.",
      meta: result
    });

  } catch (error) {
    console.error("Error in syncExternalHadist:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to sync external hadiths.",
      error: error.message
    });
  }
};

/**
 * GET /api/hadist
 * Get 1 random hadith from all available hadiths in local MongoDB.
 */
export const getDailyHadist = async (req, res) => {
  try {
    const hadist = await getRandomHadistFromDb();

    if (!hadist) {
      return res.status(404).json({
        success: false,
        message: "No hadiths found in the database. Please sync the data first."
      });
    }

    res.status(200).json({
      success: true,
      data: hadist
    });

  } catch (error) {
    console.error("Error in getDailyHadist:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hadith.",
      error: error.message
    });
  }
};

/**
 * GET /api/hadist/themes
 * Get all registered hadith themes
 */
export const getThemes = async (req, res) => {
  try {
    const themes = await HadistTheme.find({});
    res.status(200).json({
      success: true,
      data: themes
    });
  } catch (error) {
    console.error("Error in getThemes:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve themes.",
      error: error.message
    });
  }
};

/**
 * POST /api/hadist/themes
 * Save/update active themes list (replaces all existing themes)
 */
export const saveThemes = async (req, res) => {
  try {
    const { themes } = req.body; // Expects: ["sedekah", "mati", "puasa"]

    if (!themes || !Array.isArray(themes)) {
      return res.status(400).json({
        success: false,
        message: "Request body 'themes' harus berupa array string tema."
      });
    }

    // Clean up empty, duplicate, or invalid items
    const cleanedThemes = [...new Set(
      themes
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0)
    )];

    // Clear existing themes and insert new ones
    await HadistTheme.deleteMany({});
    
    if (cleanedThemes.length > 0) {
      const docs = cleanedThemes.map(name => ({ name }));
      await HadistTheme.insertMany(docs);
    }

    res.status(200).json({
      success: true,
      message: "Daftar tema hadis berhasil diperbarui.",
      data: cleanedThemes
    });
  } catch (error) {
    console.error("Error in saveThemes:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to save themes.",
      error: error.message
    });
  }
};
