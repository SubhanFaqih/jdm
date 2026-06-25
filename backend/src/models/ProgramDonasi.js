import mongoose from 'mongoose';

const programDonasiSchema = new mongoose.Schema({
  nama_program: {
    type: String,
    required: [true, 'Nama program donasi wajib diisi'], // Contoh: "Renovasi tempat wudhu akhwat"
    trim: true
  },
  target_dana: {
    type: Number,
    required: [true, 'Target dana wajib diisi'] // Contoh di gambar: 34000000
  },
  dana_terkumpul: {
    type: Number,
    default: 0 // Contoh di gambar: 12000000 (Setiap ada donatur masuk, admin tinggal update field ini)
  },
  is_active: {
    type: Boolean,
    default: false // Jika sudah selesai/terpenuhi, bisa di-nonaktifkan agar tidak muncul di layar utama
  }
}, { 
  timestamps: true 
});

// VIRTUAL FIELD: Menghitung persentase (%) & kekurangan dana secara otomatis saat data di-query
programDonasiSchema.virtual('persentase').get(function() {
  if (this.target_dana === 0) return 0;
  return Math.round((this.dana_terkumpul / this.target_dana) * 100); // Menghasilkan angka 35 atau 40 (%)
});

programDonasiSchema.virtual('kekurangan_dana').get(function() {
  const sisa = this.target_dana - this.dana_terkumpul;
  return sisa < 0 ? 0 : sisa; // Menghasilkan sisa kekurangan uang (Contoh: 22000000)
});

// Pastikan virtual field ikut dikirim ke frontend
programDonasiSchema.set('toJSON', { virtuals: true });
programDonasiSchema.set('toObject', { virtuals: true });

export default mongoose.model('ProgramDonasi', programDonasiSchema);
