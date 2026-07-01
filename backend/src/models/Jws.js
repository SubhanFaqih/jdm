import mongoose from "mongoose";
import { mongooseSocketPlugin } from '../config/mongooseSocketPlugin.js';

const prayerScheduleSchema = new mongoose.Schema({
  provinsi: { type: String, required: true },
  kabkota: { type: String, required: true },
  bulan: { type: Number, required: true },       // Menyimpan angka bulan (1-12)
  tahun: { type: Number, required: true },       // Menyimpan angka tahun (e.g., 2026)
  bulan_nama: { type: String, required: true },  // Menyimpan string bulan (e.g., "Juni")
  
  // Detail Jadwal Harian
  tanggal: { type: Number, required: true },      // Angka tanggal (1-30)
  tanggal_lengkap: { type: Date, required: true }, // Format ISO Date untuk mempermudah filter & pruning
  hari: { type: String, required: true },
  imsak: { type: String, required: true },
  subuh: { type: String, required: true },
  terbit: { type: String, required: true },
  dhuha: { type: String, required: true },
  dzuhur: { type: String, required: true },
  ashar: { type: String, required: true },
  maghrib: { type: String, required: true },
  isya: { type: String, required: true }
}, {
  timestamps: true // Menambahkan createdAt dan updatedAt otomatis
});

// KUNCI PERFORMA: Compound Index + Unique Constraint
// Memastikan tidak ada data ganda untuk kota yang sama di tanggal yang sama
prayerScheduleSchema.index({ kabkota: 1, tanggal_lengkap: 1 }, { unique: true });

prayerScheduleSchema.plugin(mongooseSocketPlugin, { modelName: 'jws' });

export default mongoose.model('PrayerSchedule', prayerScheduleSchema);