import ProfileMasjid from "../models/ProfileMasjid.js";

/**
 * GET /api/profile-masjid
 * Get list of all masjid profiles
 */
export const getProfile = async (req, res) => {
  try {
    const list = await ProfileMasjid.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error("Error in getProfile:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve masjid profile list.",
      error: error.message
    });
  }
};

/**
 * GET /api/profile-masjid/:id
 * Get details of a specific masjid profile by ID
 */
export const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await ProfileMasjid.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `Masjid profile with ID "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error("Error in getProfileById:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve masjid profile detail.",
      error: error.message
    });
  }
};

/**
 * POST /api/profile-masjid
 * Create a new masjid profile
 */
export const createProfile = async (req, res) => {
  try {
    const { nama_masjid, provinsi, kota, logo_url, background_url } = req.body;

    if (!nama_masjid || !provinsi || !kota) {
      return res.status(400).json({
        success: false,
        message: "nama_masjid, provinsi, dan kota wajib diisi."
      });
    }

    const newProfile = new ProfileMasjid({
      nama_masjid,
      provinsi,
      kota,
      logo_url: logo_url || '',
      background_url: background_url || ''
    });

    const saved = await newProfile.save();

    res.status(201).json({
      success: true,
      message: "Masjid profile successfully created.",
      data: saved
    });
  } catch (error) {
    console.error("Error in createProfile:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create masjid profile.",
      error: error.message
    });
  }
};

/**
 * PUT /api/profile-masjid/:id
 * Update an existing masjid profile by ID
 */
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_masjid, provinsi, kota, logo_url, background_url } = req.body;

    const profile = await ProfileMasjid.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `Masjid profile with ID "${id}" not found.`
      });
    }

    if (nama_masjid !== undefined) profile.nama_masjid = nama_masjid;
    if (provinsi !== undefined) profile.provinsi = provinsi;
    if (kota !== undefined) profile.kota = kota;
    if (logo_url !== undefined) profile.logo_url = logo_url;
    if (background_url !== undefined) profile.background_url = background_url;

    const updated = await profile.save();

    res.status(200).json({
      success: true,
      message: "Masjid profile successfully updated.",
      data: updated
    });
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update masjid profile.",
      error: error.message
    });
  }
};

/**
 * DELETE /api/profile-masjid/:id
 * Delete a masjid profile by ID
 */
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await ProfileMasjid.findByIdAndDelete(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `Masjid profile with ID "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Masjid profile "${profile.nama_masjid}" successfully deleted.`
    });
  } catch (error) {
    console.error("Error in deleteProfile:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete masjid profile.",
      error: error.message
    });
  }
};
