/**
 * Prayer State Engine (State Machine)
 * 
 * States:
 * - IDLE: countdown to the next prayer
 * - ADZAN: prayer time has entered, adzan is being called (always 3 minutes / 180 seconds)
 * - IQOMAH_COUNTDOWN: counting down to sholat (waktu_iqomah - 3 minutes)
 * - SHOLAT: sholat in progress (default 5 minutes / 300 seconds)
 */

const ADZAN_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

/**
 * Get timezone offset in minutes from UTC based on province name
 * @param {string} provinsi - Province name
 * @returns {number} Offset in minutes (WIB: +420, WITA: +480, WIT: +540)
 */
export const getTimezoneOffset = (provinsi) => {
  if (!provinsi) return 7 * 60; // Default to WIB (UTC+7)
  const prov = provinsi.toLowerCase();
  
  // WIT (UTC+9)
  if (prov.includes('maluku') || prov.includes('papua')) {
    return 9 * 60;
  }
  
  // WITA (UTC+8)
  if (
    prov.includes('bali') ||
    prov.includes('nusa tenggara') ||
    prov.includes('sulawesi') ||
    prov.includes('kalimantan selatan') ||
    prov.includes('kalimantan timur') ||
    prov.includes('kalimantan utara')
  ) {
    return 8 * 60;
  }
  
  // WIB (UTC+7)
  return 7 * 60;
};

/**
 * Parse time string "HH:MM" relative to a base Date adjusted for timezone offset
 * @param {Date} baseDate - Base date (current server time)
 * @param {string} timeStr - Time string "HH:MM"
 * @param {number} offsetMinutes - Timezone offset of the mosque in minutes
 * @returns {Date}
 */
export const getPrayerDate = (baseDate, timeStr, offsetMinutes = 7 * 60) => {
  if (!timeStr || timeStr === '--:--') return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Shift baseDate to target local time
  const localTimeMs = baseDate.getTime() + (offsetMinutes * 60 * 1000);
  const localDate = new Date(localTimeMs);
  
  // Set local hours and minutes (using UTC methods on the shifted date)
  localDate.setUTCHours(hours, minutes, 0, 0);
  
  // Shift back to UTC
  return new Date(localDate.getTime() - (offsetMinutes * 60 * 1000));
};

/**
 * Determine the current state based on now, today's schedule, tomorrow's schedule, and config.
 * 
 * @param {Date} now - Current server time
 * @param {Object} todaySchedule - Mongoose document or object of today's prayer schedule
 * @param {Object} tomorrowSchedule - Mongoose document or object of tomorrow's prayer schedule
 * @param {Object} activeProfile - Mosque profile containing iqomah config and sholat duration
 */
export const getCurrentPrayerState = (now, todaySchedule, tomorrowSchedule, activeProfile) => {
  const prayers = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
  const iqomahConfig = activeProfile?.waktu_iqomah || { subuh: 15, dzuhur: 10, ashar: 10, maghrib: 7, isya: 10 };
  const sholatDuration = (activeProfile?.durasi_sholat || 5) * 60 * 1000; // in ms
  const offsetMinutes = getTimezoneOffset(activeProfile?.provinsi);

  // Check if we are currently in ADZAN, IQOMAH_COUNTDOWN, or SHOLAT state for any of today's prayers
  if (todaySchedule) {
    for (const p of prayers) {
      const adzanTimeStr = todaySchedule[p];
      const adzanStart = getPrayerDate(now, adzanTimeStr, offsetMinutes);
      if (!adzanStart) continue;

      const adzanEnd = new Date(adzanStart.getTime() + ADZAN_DURATION);
      
      // waktu_iqomah is total minutes from adzanStart.
      const iqomahDelayMs = (iqomahConfig[p] || 10) * 60 * 1000;
      const iqomahEnd = new Date(adzanStart.getTime() + iqomahDelayMs);
      
      const sholatEnd = new Date(iqomahEnd.getTime() + sholatDuration);

      const nowTime = now.getTime();

      // 1. ADZAN state
      if (nowTime >= adzanStart.getTime() && nowTime < adzanEnd.getTime()) {
        return {
          state: 'ADZAN',
          prayer: p,
          remaining: Math.max(0, Math.ceil((adzanEnd.getTime() - nowTime) / 1000)),
          targetTimestamp: adzanEnd.getTime(),
          serverTime: nowTime
        };
      }

      // 2. IQOMAH_COUNTDOWN state (only if iqomahEnd is after adzanEnd)
      if (nowTime >= adzanEnd.getTime() && nowTime < iqomahEnd.getTime()) {
        return {
          state: 'IQOMAH_COUNTDOWN',
          prayer: p,
          remaining: Math.max(0, Math.ceil((iqomahEnd.getTime() - nowTime) / 1000)),
          targetTimestamp: iqomahEnd.getTime(),
          serverTime: nowTime
        };
      }

      // 3. SHOLAT state
      if (nowTime >= iqomahEnd.getTime() && nowTime < sholatEnd.getTime()) {
        return {
          state: 'SHOLAT',
          prayer: p,
          remaining: Math.max(0, Math.ceil((sholatEnd.getTime() - nowTime) / 1000)),
          targetTimestamp: sholatEnd.getTime(),
          serverTime: nowTime
        };
      }
    }
  }

  // If not in any active prayer state, we are IDLE. Find the next prayer.
  let nextPrayer = null;
  let nextPrayerTime = null;

  // Check today's remaining prayers
  if (todaySchedule) {
    for (const p of prayers) {
      const timeStr = todaySchedule[p];
      const prayerTime = getPrayerDate(now, timeStr, offsetMinutes);
      if (prayerTime && prayerTime.getTime() > now.getTime()) {
        nextPrayer = p;
        nextPrayerTime = prayerTime;
        break;
      }
    }
  }

  // If no remaining prayers today, look at tomorrow's subuh
  if (!nextPrayer && tomorrowSchedule) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const timeStr = tomorrowSchedule.subuh;
    const prayerTime = getPrayerDate(tomorrow, timeStr, offsetMinutes);
    if (prayerTime) {
      nextPrayer = 'subuh';
      nextPrayerTime = prayerTime;
    }
  }

  const remaining = nextPrayerTime 
    ? Math.max(0, Math.ceil((nextPrayerTime.getTime() - now.getTime()) / 1000))
    : 0;

  return {
    state: 'IDLE',
    nextPrayer: nextPrayer,
    remaining: remaining,
    targetTimestamp: nextPrayerTime ? nextPrayerTime.getTime() : null,
    serverTime: now.getTime()
  };
};
