import {
  syncHadistData,
  getRandomHadistFromDb,
  checkExistingHadist,
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
        message:
          "Parameter 'keyword' (tema hadis) wajib disertakan di request body.",
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
            source: "local",
          },
        });
      }
    }

    console.log(`Syncing hadiths for theme: "${keyword}"...`);
    const result = await syncHadistData(keyword, 20);

    res.status(200).json({
      success: true,
      message: "Hadiths successfully synced with database.",
      meta: result,
    });
  } catch (error) {
    console.error("Error in syncExternalHadist:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to sync external hadiths.",
      error: error.message,
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
        message:
          "No hadiths found in the database. Please sync the data first.",
      });
    }

    res.status(200).json({
      success: true,
      data: hadist,
    });
  } catch (error) {
    console.error("Error in getDailyHadist:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hadith.",
      error: error.message,
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
      data: themes,
    });
  } catch (error) {
    console.error("Error in getThemes:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve themes.",
      error: error.message,
    });
  }
};

/**
 * POST /api/hadist/themes
 * Create a new hadith theme
 */
export const createTheme = async (req, res) => {
  try {
    const { name, is_active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama tema wajib diisi.",
      });
    }

    const newTheme = new HadistTheme({
      name: name.trim().toLowerCase(),
      is_active: is_active !== undefined ? is_active : true,
    });

    const saved = await newTheme.save();

    res.status(201).json({
      success: true,
      message: "Tema hadist berhasil ditambahkan.",
      data: saved,
    });
  } catch (error) {
    // Handle mongoose unique constraint error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Tema hadist tersebut sudah ada.",
      });
    }
    console.error("Error in createTheme:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan tema hadist.",
      error: error.message,
    });
  }
};

/**
 * GET /api/hadist/themes/:id
 * Get a specific theme by ID
 */
export const getThemeById = async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await HadistTheme.findById(id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: `Tema dengan ID "${id}" tidak ditemukan.`,
      });
    }

    res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.error("Error in getThemeById:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data tema.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/hadist/themes/:id
 * Update an existing theme
 */
export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    const theme = await HadistTheme.findById(id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: `Tema dengan ID "${id}" tidak ditemukan.`,
      });
    }

    if (name !== undefined) theme.name = name.trim().toLowerCase();
    if (is_active !== undefined) theme.is_active = is_active;

    const updated = await theme.save();

    res.status(200).json({
      success: true,
      message: "Tema hadist berhasil diubah.",
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Tema hadist tersebut sudah ada.",
      });
    }
    console.error("Error in updateTheme:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengubah tema hadist.",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/hadist/themes/:id
 * Delete a theme
 */
export const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await HadistTheme.findByIdAndDelete(id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: `Tema dengan ID "${id}" tidak ditemukan.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Tema "${theme.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Error in deleteTheme:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus tema hadist.",
      error: error.message,
    });
  }
};
