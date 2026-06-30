import JadwalKhotib from "../models/JadwalKhotib.js";
import Ustadz from "../models/Ustadz.js";

/**
 * GET /api/jadwal-khotib
 * Get list of all preacher schedules (populated with ustadz details)
 * Can filter by is_utama query parameter
 */
export const getJadwalKhotibList = async (req, res) => {
  try {
    const list = await JadwalKhotib.find({})
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
    const { tanggal, ustadz_id, tema } = req.body;

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
      tema: tema || ''
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
    const { tanggal, ustadz_id, tema } = req.body;

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

/**
 * POST /api/jadwal-khotib/import
 * Bulk import Friday preacher schedules from parsed Excel JSON
 */
export const importJadwalKhotib = async (req, res) => {
  try {
    const { schedules } = req.body;

    if (!schedules || !Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: "Data schedules berupa array wajib disertakan."
      });
    }

    // 1. Fetch all ustadz for case-insensitive matching
    const allUstadz = await Ustadz.find({});
    
    const results = [];
    const errors = [];

    // Loop through each schedule item from request
    for (let i = 0; i < schedules.length; i++) {
      const item = schedules[i];
      const { tanggal, nama_khotib, tema } = item;

      if (!tanggal || !nama_khotib) {
        errors.push({
          row: i + 1,
          message: `Baris ${i + 1}: Tanggal dan Nama Khotib wajib diisi.`
        });
        continue;
      }

      const targetDate = new Date(tanggal);
      if (isNaN(targetDate.getTime())) {
        errors.push({
          row: i + 1,
          message: `Baris ${i + 1}: Format tanggal "${tanggal}" tidak valid. Gunakan YYYY-MM-DD.`
        });
        continue;
      }

      // Normalize date to midnight UTC to ensure consistency
      targetDate.setUTCHours(0, 0, 0, 0);

      // Check if preacher exists (case-insensitive)
      const cleanName = nama_khotib.trim();
      let matchedUstadz = allUstadz.find(
        (u) => u.nama.toLowerCase() === cleanName.toLowerCase()
      );

      let ustadzId;
      if (matchedUstadz) {
        ustadzId = matchedUstadz._id;
      } else {
        // Create new Ustadz if not found in DB
        try {
          const newUstadz = new Ustadz({
            nama: cleanName
          });
          const savedUstadz = await newUstadz.save();
          // Add to local list to prevent duplicate creation if same ustadz appears again in the array
          allUstadz.push(savedUstadz);
          ustadzId = savedUstadz._id;
        } catch (err) {
          errors.push({
            row: i + 1,
            message: `Baris ${i + 1}: Gagal membuat master data Ustadz "${cleanName}".`
          });
          continue;
        }
      }

      // Upsert Jadwal Khotib for this date
      try {
        const updatedSchedule = await JadwalKhotib.findOneAndUpdate(
          { tanggal: targetDate },
          { ustadz_id: ustadzId, tema: tema || "" },
          { upsert: true, new: true }
        ).populate('ustadz_id');
        
        results.push(updatedSchedule);
      } catch (err) {
        errors.push({
          row: i + 1,
          message: `Baris ${i + 1}: Gagal menyimpan jadwal khotib untuk tanggal ${tanggal}.`
        });
      }
    }

    res.status(200).json({
      success: errors.length === 0,
      message: errors.length === 0 
        ? "Semua jadwal berhasil di-import." 
        : `Berhasil meng-import ${results.length} jadwal, ${errors.length} baris gagal.`,
      data: {
        importedCount: results.length,
        errorsCount: errors.length,
        errors,
        results
      }
    });

  } catch (error) {
    console.error("Error in importJadwalKhotib:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal memproses import jadwal khotib.",
      error: error.message
    });
  }
};
