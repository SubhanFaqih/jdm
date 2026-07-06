import Ustadz from "../models/Ustadz.js";

/**
 * GET /api/ustadz
 * Get list of all preachers (can filter by is_active query parameter)
 */
export const getUstadzList = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    
    if (active !== undefined) {
      filter.is_active = active === 'true';
    }

    const list = await Ustadz.find(filter).sort({ nama: 1 });
    
    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error("Error in getUstadzList:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve preachers list.",
      error: error.message
    });
  }
};

/**
 * GET /api/ustadz/:id
 * Get detail of 1 preacher by ID
 */
export const getUstadzById = async (req, res) => {
  try {
    const { id } = req.params;
    const ustadz = await Ustadz.findById(id);

    if (!ustadz) {
      return res.status(404).json({
        success: false,
        message: `Ustadz with ID "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: ustadz
    });
  } catch (error) {
    console.error("Error in getUstadzById:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve preacher detail.",
      error: error.message
    });
  }
};

/**
 * POST /api/ustadz
 * Create a new preacher profile
 */
export const createUstadz = async (req, res) => {
  try {
    const { nama, no_hp, is_active } = req.body;
    let foto_url = req.body.foto_url || '';

    if (req.file) {
      foto_url = `/uploads/${req.file.filename}`;
    }

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: "Nama ustadz wajib diisi."
      });
    }

    const newUstadz = new Ustadz({
      nama,
      foto_url,
      no_hp,
      is_active: is_active !== undefined ? is_active : true
    });

    const saved = await newUstadz.save();

    res.status(201).json({
      success: true,
      message: "Ustadz profile successfully created.",
      data: saved
    });
  } catch (error) {
    console.error("Error in createUstadz:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create preacher profile.",
      error: error.message
    });
  }
};

/**
 * PUT /api/ustadz/:id
 * Update an existing preacher profile by ID
 */
export const updateUstadz = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, no_hp, is_active } = req.body;
    let foto_url = req.body.foto_url;

    if (req.file) {
      foto_url = `/uploads/${req.file.filename}`;
    }

    const ustadz = await Ustadz.findById(id);

    if (!ustadz) {
      return res.status(404).json({
        success: false,
        message: `Ustadz with ID "${id}" not found.`
      });
    }

    // Update fields
    if (nama !== undefined) ustadz.nama = nama;
    if (foto_url !== undefined) ustadz.foto_url = foto_url;
    if (no_hp !== undefined) ustadz.no_hp = no_hp;
    if (is_active !== undefined) ustadz.is_active = is_active;

    const updated = await ustadz.save();

    res.status(200).json({
      success: true,
      message: "Ustadz profile successfully updated.",
      data: updated
    });
  } catch (error) {
    console.error("Error in updateUstadz:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update preacher profile.",
      error: error.message
    });
  }
};

/**
 * DELETE /api/ustadz/:id
 * Delete a preacher profile by ID
 */
export const deleteUstadz = async (req, res) => {
  try {
    const { id } = req.params;
    const ustadz = await Ustadz.findByIdAndDelete(id);

    if (!ustadz) {
      return res.status(404).json({
        success: false,
        message: `Ustadz with ID "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Ustadz "${ustadz.nama}" successfully deleted.`
    });
  } catch (error) {
    console.error("Error in deleteUstadz:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete preacher profile.",
      error: error.message
    });
  }
};
