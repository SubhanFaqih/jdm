import mongoose from 'mongoose';
import { mongooseSocketPlugin } from '../config/mongooseSocketPlugin.js';

const profileMasjidSchema = new mongoose.Schema({
  nama_masjid: {
    type: String,
    required: [true, 'Nama masjid wajib diisi'],
    trim: true
  },
  provinsi: {
    type: String,
    required: [true, 'Provinsi wajib diisi'],
    trim: true
  },
  kota: {
    type: String,
    required: [true, 'Kota/Kabupaten wajib diisi'],
    trim: true
  },
  logo_url: {
    type: String,
    default: ''
  },
  background_url: {
    type: String,
    default: ''
  },
  running_text: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: false
  },
  waktu_iqomah: {
    subuh: { type: Number, default: 15 },
    dzuhur: { type: Number, default: 10 },
    ashar: { type: Number, default: 10 },
    maghrib: { type: Number, default: 7 },
    isya: { type: Number, default: 10 }
  }
}, { 
  timestamps: true 
});

profileMasjidSchema.plugin(mongooseSocketPlugin, { modelName: 'profile-masjid' });

export default mongoose.model('ProfileMasjid', profileMasjidSchema);
