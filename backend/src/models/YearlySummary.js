import mongoose from 'mongoose';

const yearlySummarySchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  totalPemasukan: {
    type: Number,
    default: 0 // Disimpan dalam sen
  },
  totalPengeluaran: {
    type: Number,
    default: 0 // Disimpan dalam sen
  }
}, { timestamps: true });

export default mongoose.model('YearlySummary', yearlySummarySchema);
