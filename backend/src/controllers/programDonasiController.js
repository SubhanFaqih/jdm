import ProgramDonasi from "../models/ProgramDonasi.js";

/**
 * GET /api/program-donasi
 * Get list of all donation programs
 * Optional query parameter: active=true/false
 */
export const getProgramDonasiList = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};

    if (active !== undefined) {
      filter.is_active = active === 'true';
    }

    const list = await ProgramDonasi.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error("Error in getProgramDonasiList:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve donation programs.",
      error: error.message
    });
  }
};

/**
 * GET /api/program-donasi/:id
 * Get detail of 1 donation program by ID
 */
export const getProgramDonasiById = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await ProgramDonasi.findById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Donation program with ID "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error("Error in getProgramDonasiById:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve donation program detail.",
      error: error.message
    });
  }
};

/**
 * POST /api/program-donasi
 * Create a new donation program
 */
export const createProgramDonasi = async (req, res) => {
  try {
    const { nama_program, target_dana, dana_terkumpul, is_active } = req.body;

    if (!nama_program || target_dana === undefined) {
      return res.status(400).json({
        success: false,
        message: "nama_program dan target_dana wajib diisi."
      });
    }

    const newProgram = new ProgramDonasi({
      nama_program,
      target_dana: Number(target_dana),
      dana_terkumpul: dana_terkumpul !== undefined ? Number(dana_terkumpul) : 0,
      is_active: is_active !== undefined ? is_active : true
    });

    const saved = await newProgram.save();

    res.status(201).json({
      success: true,
      message: "Donation program successfully created.",
      data: saved
    });
  } catch (error) {
    console.error("Error in createProgramDonasi:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create donation program.",
      error: error.message
    });
  }
};

/**
 * PUT /api/program-donasi/:id
 * Update an existing donation program by ID
 */
export const updateProgramDonasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_program, target_dana, dana_terkumpul, is_active } = req.body;

    const program = await ProgramDonasi.findById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Donation program with ID "${id}" not found.`
      });
    }

    // Update fields if provided
    if (nama_program !== undefined) program.nama_program = nama_program;
    if (target_dana !== undefined) program.target_dana = Number(target_dana);
    if (dana_terkumpul !== undefined) program.dana_terkumpul = Number(dana_terkumpul);
    if (is_active !== undefined) program.is_active = is_active;

    const updated = await program.save();

    res.status(200).json({
      success: true,
      message: "Donation program successfully updated.",
      data: updated
    });
  } catch (error) {
    console.error("Error in updateProgramDonasi:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update donation program.",
      error: error.message
    });
  }
};

/**
 * DELETE /api/program-donasi/:id
 * Delete a donation program by ID
 */
export const deleteProgramDonasi = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await ProgramDonasi.findByIdAndDelete(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Donation program with ID "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Donation program "${program.nama_program}" successfully deleted.`
    });
  } catch (error) {
    console.error("Error in deleteProgramDonasi:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete donation program.",
      error: error.message
    });
  }
};

/**
 * PATCH /api/program-donasi/:id/toggle-active
 * Set a specific donation program to active and all others to inactive
 */
export const toggleActiveDonasi = async (req, res) => {
  try {
    const { id } = req.params;
    
    const program = await ProgramDonasi.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Donation program with ID "${id}" not found.`
      });
    }

    // Set all programs to inactive
    await ProgramDonasi.updateMany({}, { is_active: false });

    // Set the selected one to active
    program.is_active = true;
    await program.save();

    res.status(200).json({
      success: true,
      message: `Donation program "${program.nama_program}" is now active.`,
      data: program
    });
  } catch (error) {
    console.error("Error in toggleActiveDonasi:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to toggle active donation program.",
      error: error.message
    });
  }
};
