import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { 
  pruneOldSchedules, 
  syncNextMonthSchedules, 
  refreshHadistSchedules 
} from '../services/schedulerService.js';

dotenv.config();

const run = async () => {
  const taskName = process.argv[2]; // Get the command-line argument (prune, sync, or hadist)

  if (!taskName) {
    console.error('Silakan tentukan task yang ingin dijalankan: "prune", "sync", atau "hadist"');
    console.log('Contoh: node src/testing/run-scheduler.js hadist');
    process.exit(1);
  }

  await connectDB();

  try {
    if (taskName === 'prune') {
      console.log('[Runner] Memulai task: pruneOldSchedules...');
      await pruneOldSchedules();
      console.log('[Runner] Task prune selesai.');
    } else if (taskName === 'sync') {
      console.log('[Runner] Memulai task: syncNextMonthSchedules...');
      await syncNextMonthSchedules();
      console.log('[Runner] Task sync selesai.');
    } else if (taskName === 'hadist') {
      console.log('[Runner] Memulai task: refreshHadistSchedules...');
      await refreshHadistSchedules();
      console.log('[Runner] Task hadist selesai.');
    } else {
      console.error(`Task tidak dikenal: "${taskName}". Gunakan "prune", "sync", atau "hadist"`);
    }
  } catch (error) {
    console.error('Error saat mengeksekusi task:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('[Runner] Koneksi database ditutup.');
  }
};

run();
