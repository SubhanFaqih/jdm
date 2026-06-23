import mongoose from 'mongoose';

const kasLogSchema = new mongoose.Schema({
  tipe: {
    type: String,
    enum: ['pemasukan', 'pengeluaran'], // Validasi hanya boleh diisi antara 2 teks ini
    required: [true, 'Tipe transaksi wajib diisi']
  },
  nominal: {
    type: Number,
    required: [true, 'Nominal uang wajib diisi']
  },
  keterangan: {
    type: String,
    required: [true, 'Keterangan transaksi wajib diisi'], // Misal: "Kotak amal jumat", "Beli kipas angin"
    trim: true
  },
  tanggal: {
    type: Date,
    default: Date.now // Otomatis terisi tanggal hari ini saat di-input admin
  }
}, { 
  timestamps: true 
});

export default mongoose.model('KasLog', kasLogSchema);
