import KasLog from "../models/KasLog.js";

/**
 * GET /api/kas
 * Get history of all cash transactions, sorted by date (newest first)
 */
export const getKasLogs = async (req, res) => {
  try {
    const list = await KasLog.find({}).sort({ tanggal: -1, createdAt: -1 });

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

/**
 * POST /api/kas
 * Register a new cash transaction (pemasukan or pengeluaran)
 */
export const createKasLog = async (req, res) => {
  try {
    const { tipe, nominal, keterangan, tanggal } = req.body;

    // Validation
    if (!tipe || !nominal || !keterangan) {
      return res.status(400).json({
        success: false,
        message: "tipe, nominal, dan keterangan wajib diisi."
      });
    }

    if (tipe !== 'pemasukan' && tipe !== 'pengeluaran') {
      return res.status(400).json({
        success: false,
        message: "tipe transaksi harus berupa 'pemasukan' atau 'pengeluaran'."
      });
    }

    if (Number(nominal) <= 0) {
      return res.status(400).json({
        success: false,
        message: "nominal transaksi harus lebih besar dari 0."
      });
    }

    const newLog = new KasLog({
      tipe,
      nominal: Number(nominal),
      keterangan,
      tanggal: tanggal ? new Date(tanggal) : new Date()
    });

    const saved = await newLog.save();

    res.status(201).json({
      success: true,
      message: "Transaction log successfully created.",
      data: saved
    });
  } catch (error) {
    console.error("Error in createKasLog:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create transaction log.",
      error: error.message
    });
  }
};

/**
 * GET /api/kas/stats
 * Calculate cash summary stats (saldo sekarang, pemasukan & pengeluaran bulan ini)
 */
export const getKasStats = async (req, res) => {
  try {
    const now = new Date();
    // Construct boundaries for current calendar month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [allTimeStats, currentMonthStats] = await Promise.all([
      // 1. Calculate overall sums
      KasLog.aggregate([
        {
          $group: {
            _id: null,
            totalPemasukan: {
              $sum: { $cond: [{ $eq: ["$tipe", "pemasukan"] }, "$nominal", 0] }
            },
            totalPengeluaran: {
              $sum: { $cond: [{ $eq: ["$tipe", "pengeluaran"] }, "$nominal", 0] }
            }
          }
        }
      ]),
      // 2. Calculate sums for current month
      KasLog.aggregate([
        {
          $match: {
            tanggal: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            pemasukanBulanIni: {
              $sum: { $cond: [{ $eq: ["$tipe", "pemasukan"] }, "$nominal", 0] }
            },
            pengeluaranBulanIni: {
              $sum: { $cond: [{ $eq: ["$tipe", "pengeluaran"] }, "$nominal", 0] }
            }
          }
        }
      ])
    ]);

    const totalPemasukan = allTimeStats[0]?.totalPemasukan || 0;
    const totalPengeluaran = allTimeStats[0]?.totalPengeluaran || 0;
    const saldoSekarang = totalPemasukan - totalPengeluaran;

    const pemasukanBulanIni = currentMonthStats[0]?.pemasukanBulanIni || 0;
    const pengeluaranBulanIni = currentMonthStats[0]?.pengeluaranBulanIni || 0;

    res.status(200).json({
      success: true,
      data: {
        saldo_sekarang: saldoSekarang,
        pemasukan_bulan_ini: pemasukanBulanIni,
        pengeluaran_bulan_ini: pengeluaranBulanIni,
        total_pemasukan: totalPemasukan,
        total_pengeluaran: totalPengeluaran
      }
    });
  } catch (error) {
    console.error("Error in getKasStats:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to calculate cash statistics.",
      error: error.message
    });
  }
};
