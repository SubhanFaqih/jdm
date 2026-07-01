import mongoose from 'mongoose';
import { mongooseSocketPlugin } from '../config/mongooseSocketPlugin.js';

const ustadzSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama ustadz wajib diisi'],
    trim: true
  },
  foto_url: {
    type: String,
    default: 'https://example.com/images/default-avatar.jpg' // URL foto default jika admin tidak upload
  },
  no_hp: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Otomatis membuat field createdAt dan updatedAt
});

ustadzSchema.plugin(mongooseSocketPlugin, { modelName: 'ustadz' });

export default mongoose.model('Ustadz', ustadzSchema);
