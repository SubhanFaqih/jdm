import { getIO } from '../services/socketService.js';

export function mongooseSocketPlugin(schema, options) {
  const modelName = options?.modelName || 'data';

  // Triggered on new document creation or save() updates
  schema.post('save', function (doc) {
    const io = getIO();
    if (io) {
      console.log(`Socket: [save] emitting update for model ${modelName} (ID: ${doc._id})`);
      io.emit('data-updated', { target: modelName, action: 'save', id: doc._id });
    }
  });

  // Triggered on findOneAndUpdate
  schema.post('findOneAndUpdate', function (doc) {
    if (doc) {
      const io = getIO();
      if (io) {
        console.log(`Socket: [findOneAndUpdate] emitting update for model ${modelName} (ID: ${doc._id})`);
        io.emit('data-updated', { target: modelName, action: 'update', id: doc._id });
      }
    }
  });

  // Triggered on findOneAndDelete / findByIdAndDelete
  schema.post('findOneAndDelete', function (doc) {
    if (doc) {
      const io = getIO();
      if (io) {
        console.log(`Socket: [findOneAndDelete] emitting update for model ${modelName} (ID: ${doc._id})`);
        io.emit('data-updated', { target: modelName, action: 'delete', id: doc._id });
      }
    }
  });
}
