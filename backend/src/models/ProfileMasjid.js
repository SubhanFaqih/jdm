import mongoose from 'mongoose';

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
  }
}, { 
  timestamps: true 
});

export default mongoose.model('ProfileMasjid', profileMasjidSchema);
