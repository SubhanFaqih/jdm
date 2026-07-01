import mongoose from 'mongoose';
import { mongooseSocketPlugin } from '../config/mongooseSocketPlugin.js';

const kasLogSchema = new mongoose.Schema({
  kasId: {
    type: Number,
    unique: true
  },
  tipe: {
    type: String,
    enum: ['pemasukan', 'pengeluaran'],
    required: [true, 'Tipe transaksi wajib diisi']
  },
  nominal: {
    type: Number, // Disimpan dalam satuan sen (integer)
    required: [true, 'Nominal uang wajib diisi']
  },
  keterangan: {
    type: String,
    required: [true, 'Keterangan transaksi wajib diisi'],
    trim: true
  },
  tanggal: {
    type: Date,
    default: Date.now
  },
  program_donasi_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramDonasi',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

kasLogSchema.index({ tanggal: -1 });
kasLogSchema.index({ isDeleted: 1 });

kasLogSchema.plugin(mongooseSocketPlugin, { modelName: 'kas' });

export default mongoose.model('KasLog', kasLogSchema);
