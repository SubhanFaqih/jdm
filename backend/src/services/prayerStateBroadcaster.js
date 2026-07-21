import { getIO } from './socketService.js';
import ProfileMasjid from '../models/ProfileMasjid.js';
import PrayerSchedule from '../models/Jws.js';
import { getCurrentPrayerState } from './prayerStateService.js';

let broadcastInterval = null;
let cachedState = null;

/**
 * Get the last broadcasted state (cached)
 * Useful for serving quick responses on connect
 */
export const getCachedPrayerState = () => cachedState;

/**
 * Start the periodic broadcast of prayer state
 */
export const startPrayerStateBroadcaster = () => {
  if (broadcastInterval) return;

  broadcastInterval = setInterval(async () => {
    try {
      const io = getIO();
      if (!io) return;

      // 1. Fetch active profile
      const activeProfile = await ProfileMasjid.findOne({ is_active: true });
      if (!activeProfile) {
        const state = { state: 'IDLE', message: 'No active profile', serverTime: Date.now() };
        cachedState = state;
        io.emit('prayer-state', state);
        return;
      }

      // 2. Fetch today's and tomorrow's schedules
      const now = new Date();
      
      const pad = (n) => n.toString().padStart(2, '0');
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const todayDate = new Date(`${todayStr}T00:00:00Z`);

      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
      const tomorrowDate = new Date(`${tomorrowStr}T00:00:00Z`);

      const todaySchedule = await PrayerSchedule.findOne({
        kabkota: { $regex: new RegExp(`^${activeProfile.kota}$`, 'i') },
        tanggal_lengkap: todayDate
      });

      const tomorrowSchedule = await PrayerSchedule.findOne({
        kabkota: { $regex: new RegExp(`^${activeProfile.kota}$`, 'i') },
        tanggal_lengkap: tomorrowDate
      });

      // 3. Determine current state
      const state = getCurrentPrayerState(now, todaySchedule, tomorrowSchedule, activeProfile);

      const payload = {
        ...state,
        runningText: activeProfile.running_text,
        iqomahConfig: activeProfile.waktu_iqomah,
        todaySchedule: todaySchedule ? {
          subuh: todaySchedule.subuh,
          dzuhur: todaySchedule.dzuhur,
          ashar: todaySchedule.ashar,
          maghrib: todaySchedule.maghrib,
          isya: todaySchedule.isya,
          terbit: todaySchedule.terbit || todaySchedule.syuruq,
          imsak: todaySchedule.imsak,
          dhuha: todaySchedule.dhuha
        } : null
      };

      cachedState = payload;
      io.emit('prayer-state', payload);
    } catch (error) {
      console.error('[Broadcaster] Error broadcasting prayer state:', error.message);
    }
  }, 1000);

  console.log('[Broadcaster] Prayer state broadcaster started.');
};

/**
 * Stop the periodic broadcast of prayer state
 */
export const stopPrayerStateBroadcaster = () => {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
    console.log('[Broadcaster] Prayer state broadcaster stopped.');
  }
};
