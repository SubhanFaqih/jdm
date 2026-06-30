import mongoose from "mongoose";

const hadistSchema = new mongoose.Schema({
  keyword: { type: String, required: true, index: true }, // Tema/kata kunci pencarian (e.g., "kiamat", "puasa")
  hadistId: { type: Number, required: true },             // ID hadis dari API eksternal (api.myquran.com)
  text: { type: String, required: true },                 // Isi teks hadis
  focus: [{ type: String }],                             // Kata/frasa fokus pencarian dari API
  takhrij: { type: String }                              // Sumber/Riwayat hadis (takhrij)
}, {
  timestamps: true // Menambahkan createdAt dan updatedAt otomatis
});

// KUNCI PERFORMA & INTEGRITAS DATA:
// Mencegah penyimpanan hadis dengan ID yang sama di bawah kata kunci (keyword) yang sama
hadistSchema.index({ keyword: 1, hadistId: 1 }, { unique: true });

export default mongoose.model('Hadist', hadistSchema);
