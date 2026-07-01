import mongoose from 'mongoose';
import { mongooseSocketPlugin } from '../config/mongooseSocketPlugin.js';

const jadwalKhotibSchema = new mongoose.Schema({
  tanggal: {
    type: Date,
    required: [true, 'Tanggal jadwal wajib diisi'],
    unique: true // Mencegah double assign jadwal di tanggal/hari yang sama
  },
  ustadz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ustadz', // Menghubungkan (relasi) ke collection Ustadz
    required: [true, 'Ustadz harus di-assign']
  },
  tema: {
    type: String,
    default: '' // Opsional, bisa dikosongkan
  }
}, { 
  timestamps: true 
});

jadwalKhotibSchema.plugin(mongooseSocketPlugin, { modelName: 'jadwal-khotib' });

export default mongoose.model('JadwalKhotib', jadwalKhotibSchema);
