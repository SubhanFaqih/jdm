import KasLog from "../models/KasLog.js";
import MonthlySummary from "../models/MonthlySummary.js";
import YearlySummary from "../models/YearlySummary.js";
import AuditLog from "../models/AuditLog.js";
import Counter from "../models/Counter.js";
import ProgramDonasi from "../models/ProgramDonasi.js";

// Helper for synchronous summary updates
const updateSummaries = async (date, tipe, nominalChange) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  const incQuery = {};
  if (tipe === 'pemasukan') {
    incQuery.totalPemasukan = nominalChange;
  } else {
    incQuery.totalPengeluaran = nominalChange;
  }

  await MonthlySummary.findOneAndUpdate(
    { year, month },
    { $inc: incQuery },
    { upsert: true }
  );

  await YearlySummary.findOneAndUpdate(
    { year },
    { $inc: incQuery },
    { upsert: true }
  );
};

export const getKasLogs = async (req, res) => {
  try {
    const list = await KasLog.find({ isDeleted: false }).sort({ tanggal: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error("Error in getKasLogs:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve cash transaction history.",
      error: error.message
    });
  }
};

export const createKasLog = async (req, res) => {
  try {
    const { tipe, nominal, keterangan, tanggal, program_donasi_id } = req.body;

    if (!tipe || !nominal || !keterangan) {
      return res.status(400).json({ success: false, message: "tipe, nominal, dan keterangan wajib diisi." });
    }

    if (tipe !== 'pemasukan' && tipe !== 'pengeluaran') {
      return res.status(400).json({ success: false, message: "tipe transaksi harus 'pemasukan' atau 'pengeluaran'." });
    }

    if (Number(nominal) <= 0) {
      return res.status(400).json({ success: false, message: "nominal transaksi harus lebih dari 0." });
    }

    const txDate = tanggal ? new Date(tanggal) : new Date();
    // Convert to cents
    const nominalCents = Math.round(Number(nominal) * 100);

    // Get auto-increment ID
    const counter = await Counter.findOneAndUpdate(
      { _id: 'kasId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newLog = new KasLog({
      kasId: counter.seq,
      tipe,
      nominal: nominalCents,
      keterangan,
      tanggal: txDate,
      program_donasi_id: program_donasi_id || null
    });

    const saved = await newLog.save();

    // Synchronous update to summaries
    await updateSummaries(txDate, tipe, nominalCents);

    // If it's linked to a donation program, increment its dana_terkumpul
    if (program_donasi_id && tipe === 'pemasukan') {
      await ProgramDonasi.findByIdAndUpdate(
        program_donasi_id,
        { $inc: { dana_terkumpul: Number(nominal) } } // using raw nominal (not cents) as ProgramDonasi uses raw nominal
      );
    }

    // Record Audit Log for CREATE
    await AuditLog.create({
      action: 'CREATE',
      collectionName: 'KasLogs',
      documentId: saved._id,
      newData: saved.toObject()
    });

    res.status(201).json({
      success: true,
      message: "Transaction log successfully created.",
      data: saved
    });
  } catch (error) {
    console.error("Error in createKasLog:", error.message);
    res.status(500).json({ success: false, message: "Failed to create transaction log.", error: error.message });
  }
};

export const updateKasLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipe, nominal, keterangan, tanggal, program_donasi_id } = req.body;

    const oldLog = await KasLog.findById(id);
    if (!oldLog || oldLog.isDeleted) {
      return res.status(404).json({ success: false, message: "Transaction not found or deleted." });
    }

    // Save a copy of the original data BEFORE mutating the document
    const originalData = oldLog.toObject();

    // Revert old summary
    await updateSummaries(oldLog.tanggal, oldLog.tipe, -oldLog.nominal);

    const txDate = tanggal ? new Date(tanggal) : oldLog.tanggal;
    const nominalCents = nominal ? Math.round(Number(nominal) * 100) : oldLog.nominal;
    const newTipe = tipe || oldLog.tipe;
    const oldDonasiId = oldLog.program_donasi_id;
    const oldTipe = oldLog.tipe;
    const oldNominal = oldLog.nominal / 100; // raw

    oldLog.tipe = newTipe;
    oldLog.nominal = nominalCents;
    if (keterangan) oldLog.keterangan = keterangan;
    oldLog.tanggal = txDate;
    if (program_donasi_id !== undefined) oldLog.program_donasi_id = program_donasi_id || null;

    const saved = await oldLog.save();

    // Apply new summary
    await updateSummaries(txDate, newTipe, nominalCents);

    // Sync Program Donasi logic
    const newNominal = nominal ? Number(nominal) : oldNominal;
    
    // Case 1: Removed from a donation program
    if (oldDonasiId && (!program_donasi_id || newTipe !== 'pemasukan') && oldTipe === 'pemasukan') {
      await ProgramDonasi.findByIdAndUpdate(oldDonasiId, { $inc: { dana_terkumpul: -oldNominal } });
    }
    // Case 2: Added to a new donation program
    else if (!oldDonasiId && program_donasi_id && newTipe === 'pemasukan') {
      await ProgramDonasi.findByIdAndUpdate(program_donasi_id, { $inc: { dana_terkumpul: newNominal } });
    }
    // Case 3: Changed from one donation program to another
    else if (oldDonasiId && program_donasi_id && oldDonasiId.toString() !== program_donasi_id && newTipe === 'pemasukan' && oldTipe === 'pemasukan') {
      await ProgramDonasi.findByIdAndUpdate(oldDonasiId, { $inc: { dana_terkumpul: -oldNominal } });
      await ProgramDonasi.findByIdAndUpdate(program_donasi_id, { $inc: { dana_terkumpul: newNominal } });
    }
    // Case 4: Same donation program, but nominal changed
    else if (oldDonasiId && program_donasi_id && oldDonasiId.toString() === program_donasi_id && newTipe === 'pemasukan' && oldTipe === 'pemasukan') {
      const diff = newNominal - oldNominal;
      if (diff !== 0) {
        await ProgramDonasi.findByIdAndUpdate(program_donasi_id, { $inc: { dana_terkumpul: diff } });
      }
    }

    // Record Audit Log
    await AuditLog.create({
      action: 'UPDATE',
      collectionName: 'KasLogs',
      documentId: saved._id,
      oldData: originalData,
      newData: saved.toObject()
    });

    res.status(200).json({
      success: true,
      message: "Transaction log successfully updated.",
      data: saved
    });
  } catch (error) {
    console.error("Error in updateKasLog:", error.message);
    res.status(500).json({ success: false, message: "Failed to update transaction log.", error: error.message });
  }
};

export const deleteKasLog = async (req, res) => {
  try {
    const { id } = req.params;
    const oldLog = await KasLog.findById(id);

    if (!oldLog || oldLog.isDeleted) {
      return res.status(404).json({ success: false, message: "Transaction not found or already deleted." });
    }

    oldLog.isDeleted = true;
    oldLog.deletedAt = new Date();
    await oldLog.save();

    // Revert summary
    await updateSummaries(oldLog.tanggal, oldLog.tipe, -oldLog.nominal);

    // Revert Program Donasi
    if (oldLog.program_donasi_id && oldLog.tipe === 'pemasukan') {
      await ProgramDonasi.findByIdAndUpdate(oldLog.program_donasi_id, { $inc: { dana_terkumpul: -(oldLog.nominal / 100) } });
    }

    // Record Audit Log
    await AuditLog.create({
      action: 'DELETE',
      collectionName: 'KasLogs',
      documentId: oldLog._id,
      oldData: oldLog.toObject()
    });

    res.status(200).json({
      success: true,
      message: "Transaction log successfully deleted (soft delete)."
    });
  } catch (error) {
    console.error("Error in deleteKasLog:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete transaction log.", error: error.message });
  }
};

export const getKasStats = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [yearlyStat, monthlyStat] = await Promise.all([
      YearlySummary.aggregate([
        {
          $group: {
            _id: null,
            totalPemasukanAllTime: { $sum: "$totalPemasukan" },
            totalPengeluaranAllTime: { $sum: "$totalPengeluaran" }
          }
        }
      ]),
      MonthlySummary.findOne({ year, month })
    ]);

    const totalPemasukan = yearlyStat[0]?.totalPemasukanAllTime || 0;
    const totalPengeluaran = yearlyStat[0]?.totalPengeluaranAllTime || 0;
    const saldoSekarang = totalPemasukan - totalPengeluaran;

    const pemasukanBulanIni = monthlyStat?.totalPemasukan || 0;
    const pengeluaranBulanIni = monthlyStat?.totalPengeluaran || 0;

    res.status(200).json({
      success: true,
      data: {
        saldo_sekarang: saldoSekarang, // in cents
        pemasukan_bulan_ini: pemasukanBulanIni, // in cents
        pengeluaran_bulan_ini: pengeluaranBulanIni, // in cents
        total_pemasukan: totalPemasukan, // in cents
        total_pengeluaran: totalPengeluaran // in cents
      }
    });
  } catch (error) {
    console.error("Error in getKasStats:", error.message);
    res.status(500).json({ success: false, message: "Failed to calculate cash statistics.", error: error.message });
  }
};
