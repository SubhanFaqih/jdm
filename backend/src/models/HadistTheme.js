import mongoose from "mongoose";

const hadistThemeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  }, // Nama tema (e.g., "kiamat", "sedekah")
  is_active: { 
    type: Boolean, 
    default: true 
  } // Status apakah tema ini aktif untuk di-sync
}, {
  timestamps: true // Menambahkan createdAt dan updatedAt otomatis
});

export default mongoose.model('HadistTheme', hadistThemeSchema);
