import cron from 'node-cron';
import PrayerSchedule from '../models/Jws.js';
import Hadist from '../models/Hadist.js';
import HadistTheme from '../models/HadistTheme.js';
import ProfileMasjid from '../models/ProfileMasjid.js';
import { syncPrayerSchedule, checkExistingSchedule } from './jwsService.js';
import { syncHadistData } from './hadistService.js';

/**
 * Task: Prune old schedules where the month has passed
 */
export const pruneOldSchedules = async () => {
  try {
    const now = new Date();
    // First day of the current month in UTC
    const firstDayOfCurrentMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

    console.log(`[Scheduler] Running pruning task...`);
    const result = await PrayerSchedule.deleteMany({
      tanggal_lengkap: { $lt: firstDayOfCurrentMonth }
    });

    console.log(`[Scheduler] Pruned ${result.deletedCount} old prayer schedules.`);
  } catch (error) {
    console.error('[Scheduler] Error in pruning task:', error.message);
  }
};

/**
 * Task: Fetch next month's schedule for all active cities in DB
 */
export const syncNextMonthSchedules = async () => {
  try {
    console.log(`[Scheduler] Running monthly sync task for next month...`);

    // 1. Get all unique active cities and provinces from mosque profiles
    const activeLocations = await ProfileMasjid.aggregate([
      {
        $group: {
          _id: { kabkota: "$kota", provinsi: "$provinsi" }
        }
      }
    ]);

    if (activeLocations.length === 0) {
      console.log('[Scheduler] No active profiles found in database to sync.');
      return;
    }

    // 2. Calculate next month and year
    const now = new Date();
    let nextMonth = now.getMonth() + 2; // now.getMonth() is 0-indexed (0 = Jan). Next month number is getMonth() + 2.
    let nextYear = now.getFullYear();

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    console.log(`[Scheduler] Syncing for Month: ${nextMonth}, Year: ${nextYear} for ${activeLocations.length} location(s)`);

    // 3. Sync each location
    for (const loc of activeLocations) {
      const { kabkota, provinsi } = loc._id;
      try {
        const existing = await checkExistingSchedule(kabkota, nextMonth, nextYear);
        if (existing) {
          console.log(`[Scheduler] Prayer schedule for ${kabkota} on ${nextMonth}/${nextYear} already exists. Sync skipped.`);
          continue;
        }

        console.log(`[Scheduler] Auto-syncing next month for ${kabkota}, ${provinsi}...`);
        await syncPrayerSchedule(provinsi, kabkota, nextMonth, nextYear);
        console.log(`[Scheduler] Successfully auto-synced ${kabkota}, ${provinsi}.`);
      } catch (err) {
        console.error(`[Scheduler] Failed to sync ${kabkota}, ${provinsi}:`, err.message);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error in monthly sync task:', error.message);
  }
};

/**
 * Task: Clear all hadiths and fetch fresh random hadiths for defined themes
 */
export const refreshHadistSchedules = async () => {
  try {
    console.log('[Scheduler] Running daily hadith refresh task...');
    
    // 1. Fetch active themes from MongoDB
    const activeThemesFromDb = await HadistTheme.find({ is_active: true });
    let themesToSync = activeThemesFromDb.map(t => t.name);

    // Fallback if DB themes list is empty
    if (themesToSync.length === 0) {
      themesToSync = ['kiamat', 'surga', 'mati', 'sedekah', 'ilmu'];
      console.log(`[Scheduler] DB tema kosong. Menggunakan fallback themes: [${themesToSync.join(', ')}]`);
    } else {
      console.log(`[Scheduler] Menemukan tema aktif dari DB: [${themesToSync.join(', ')}]`);
    }

    // 2. Delete all existing hadiths
    const deleteResult = await Hadist.deleteMany({});
    console.log(`[Scheduler] Cleared ${deleteResult.deletedCount} old hadiths from database.`);

    // 3. Sync each theme with a 2-second delay to avoid API rate limits (HTTP 429)
    for (const theme of themesToSync) {
      try {
        console.log(`[Scheduler] Syncing fresh hadiths for theme: "${theme}"...`);
        const result = await syncHadistData(theme, 20);
        console.log(`[Scheduler] Successfully synced ${result.totalSynced} hadiths for theme: "${theme}".`);
        
        // Wait 2 seconds before next request
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        console.error(`[Scheduler] Failed to sync theme "${theme}":`, err.message);
        // Wait even if it fails to give the API breathing room
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log('[Scheduler] Hadith refresh task completed successfully.');
  } catch (error) {
    console.error('[Scheduler] Error in daily hadith refresh task:', error.message);
  }
};

/**
 * Initialize all cron jobs
 */
export const initScheduler = () => {
  console.log('[Scheduler] Initializing background tasks...');

  // 1. Prune old data: Runs on the 1st day of every month at 00:05 UTC/Local time
  cron.schedule('5 0 1 * *', async () => {
    await pruneOldSchedules();
  });

  // 2. Fetch next month's schedule: Runs on the 25th of every month at 01:00 UTC/Local time
  cron.schedule('0 1 25 * *', async () => {
    await syncNextMonthSchedules();
  });

  // 3. Daily Hadith refresh: Runs every day at 00:00 UTC/Local time
  cron.schedule('0 0 * * *', async () => {
    await refreshHadistSchedules();
  });

  console.log('[Scheduler] Tasks successfully scheduled.');
};
