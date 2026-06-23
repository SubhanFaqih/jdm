import JadwalKhotib from "../models/JadwalKhotib.js";
import Ustadz from "../models/Ustadz.js";

/**
 * GET /api/jadwal-khotib
 * Get list of all preacher schedules (populated with ustadz details)
 * Can filter by is_utama query parameter
 */
export const getJadwalKhotibList = async (req, res) => {
  try {
    const { utama } = req.query;
    const filter = {};

    if (utama !== undefined) {
      filter.is_utama = utama === 'true';
    }

    const list = await JadwalKhotib.find(filter)
      .populate('ustadz_id')
      .sort({ tanggal: 1 });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error("Error in getJadwalKhotibList:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve schedules list.",
      error: error.message
    });
  }
};

/**
 * GET /api/jadwal-khotib/:id
 * Get detail of 1 preacher schedule by ID
 */
export const getJadwalKhotibById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await JadwalKhotib.findById(id).populate('ustadz_id');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: `Schedule with ID "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error("Error in getJadwalKhotibById:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve schedule detail.",
      error: error.message
    });
  }
};

/**
 * POST /api/jadwal-khotib
 * Create a new preacher schedule assignment
 */
export const createJadwalKhotib = async (req, res) => {
  try {
    const { tanggal, ustadz_id, tema, is_utama } = req.body;

    if (!tanggal || !ustadz_id) {
      return res.status(400).json({
        success: false,
        message: "Tanggal dan ustadz_id wajib diisi."
      });
    }

    // Verify ustadz exists
    const ustadzExists = await Ustadz.findById(ustadz_id);
    if (!ustadzExists) {
      return res.status(404).json({
        success: false,
        message: `Ustadz with ID "${ustadz_id}" does not exist.`
      });
    }

    // Check if a schedule already exists on this date
    const targetDate = new Date(tanggal);
    const existingSchedule = await JadwalKhotib.findOne({ tanggal: targetDate });
    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: `Jadwal khotib pada tanggal ${tanggal} sudah terisi.`
      });
    }

    const newSchedule = new JadwalKhotib({
      tanggal: targetDate,
      ustadz_id,
      tema: tema || '',
      is_utama: is_utama !== undefined ? is_utama : false
    });

    const saved = await newSchedule.save();
    const populated = await saved.populate('ustadz_id');

    res.status(201).json({
      success: true,
      message: "Jadwal khotib successfully created.",
      data: populated
    });
  } catch (error) {
    console.error("Error in createJadwalKhotib:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create preacher schedule.",
      error: error.message
    });
  }
};

/**
 * PUT /api/jadwal-khotib/:id
 * Update an existing preacher schedule by ID
 */
export const updateJadwalKhotib = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, ustadz_id, tema, is_utama } = req.body;

    const schedule = await JadwalKhotib.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: `Schedule with ID "${id}" not found.`
      });
    }

    if (ustadz_id !== undefined) {
      const ustadzExists = await Ustadz.findById(ustadz_id);
      if (!ustadzExists) {
        return res.status(404).json({
          success: false,
          message: `Ustadz with ID "${ustadz_id}" does not exist.`
        });
      }
      schedule.ustadz_id = ustadz_id;
    }

    if (tanggal !== undefined) {
      const targetDate = new Date(tanggal);
      // Ensure we don't duplicate schedule dates on update
      const existingSchedule = await JadwalKhotib.findOne({ 
        tanggal: targetDate, 
        _id: { $ne: id } 
      });
      if (existingSchedule) {
        return res.status(400).json({
          success: false,
          message: `Jadwal khotib pada tanggal ${tanggal} sudah terisi oleh jadwal lain.`
        });
      }
      schedule.tanggal = targetDate;
    }

    if (tema !== undefined) schedule.tema = tema;
    if (is_utama !== undefined) schedule.is_utama = is_utama;

    const updated = await schedule.save();
    const populated = await updated.populate('ustadz_id');

    res.status(200).json({
      success: true,
      message: "Jadwal khotib successfully updated.",
      data: populated
    });
  } catch (error) {
    console.error("Error in updateJadwalKhotib:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update preacher schedule.",
      error: error.message
    });
  }
};

/**
 * DELETE /api/jadwal-khotib/:id
 * Delete a preacher schedule by ID
 */
export const deleteJadwalKhotib = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await JadwalKhotib.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: `Schedule with ID "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: "Jadwal khotib successfully deleted."
    });
  } catch (error) {
    console.error("Error in deleteJadwalKhotib:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete preacher schedule.",
      error: error.message
    });
  }
};
