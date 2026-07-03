import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true
  },
  collectionName: {
    type: String,
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  oldData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  performedAt: {
    type: Date,
    default: Date.now
  }
});

auditLogSchema.index({ documentId: 1 });
auditLogSchema.index({ collectionName: 1, action: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
