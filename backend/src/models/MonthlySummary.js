import mongoose from 'mongoose';

const monthlySummarySchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true // 1-12
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

monthlySummarySchema.index({ year: 1, month: 1 }, { unique: true });

export default mongoose.model('MonthlySummary', monthlySummarySchema);
