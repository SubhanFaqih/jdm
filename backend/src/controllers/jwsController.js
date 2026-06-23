import { 
  syncPrayerSchedule, 
  getDailyScheduleFromDb, 
  checkExistingSchedule 
} from '../services/jwsService.js';
import ProfileMasjid from '../models/ProfileMasjid.js';

/**
 * POST /api/jws/sync
 * Sync monthly prayer schedule from equran.id and save it to local MongoDB
 */
export const syncExternalSchedule = async (req, res) => {
  let { provinsi, kabkota, profile_id, profileId, bulan, tahun, force } = req.body;
  const pId = profile_id || profileId;

  try {
    if (pId) {
      const profile = await ProfileMasjid.findById(pId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: `ProfileMasjid with ID "${pId}" not found.`
        });
      }
      provinsi = profile.provinsi;
      kabkota = profile.kota;
    }

    if (!provinsi || !kabkota) {
      return res.status(400).json({
        success: false,
        message: 'Provinsi and kabkota (or profile_id) are required in the request body.'
      });
    }

    const targetBulan = bulan ? Number(bulan) : new Date().getMonth() + 1;
    const targetTahun = tahun ? Number(tahun) : new Date().getFullYear();

    if (!force) {
      // Check if data already exists in local DB using the service
      const existing = await checkExistingSchedule(kabkota, targetBulan, targetTahun);

      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Prayer schedule already exists in the database. Sync skipped.',
          meta: {
            provinsi,
            kabkota: existing.kabkota, // Use exact name from DB
            bulan: targetBulan,
            tahun: targetTahun,
            source: 'local'
          }
        });
      }
    }

    // Fetch and sync data using the service
    console.log(`Syncing prayer schedule for ${kabkota}, ${provinsi}...`);
    const result = await syncPrayerSchedule(provinsi, kabkota, targetBulan, targetTahun);

    res.status(200).json({
      success: true,
      message: 'Prayer schedule successfully synced with database.',
      meta: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to sync external schedule.',
      error: error.message
    });
  }
};

/**
 * GET /api/jws
 * Get daily prayer schedule from local MongoDB by date
 */
export const getDailySchedule = async (req, res) => {
  let { kabkota, tanggal, profile_id, profileId } = req.query;
  const pId = profile_id || profileId;
  let provinsi;

  try {
    if (pId) {
      const profile = await ProfileMasjid.findById(pId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: `ProfileMasjid with ID "${pId}" not found.`
        });
      }
      provinsi = profile.provinsi;
      kabkota = profile.kota;
    }

    if (!kabkota || !tanggal) {
      return res.status(400).json({
        success: false,
        message: 'kabkota (or profile_id) and tanggal (YYYY-MM-DD) query parameters are required.'
      });
    }

    // Parse target date and construct start/end range in UTC to avoid timezone issues
    const targetDate = new Date(`${tanggal}T00:00:00Z`);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tanggal format. Please use YYYY-MM-DD.'
      });
    }

    // Query database for matching city and date using the service
    let schedule = await getDailyScheduleFromDb(kabkota, targetDate);

    // On-the-fly auto-sync if not found and we have the province information
    if (!schedule && provinsi) {
      const targetBulan = targetDate.getMonth() + 1;
      const targetTahun = targetDate.getFullYear();
      console.log(`[Auto-sync] Prayer schedule for ${kabkota} on ${targetBulan}/${targetTahun} not found. Syncing...`);
      try {
        await syncPrayerSchedule(provinsi, kabkota, targetBulan, targetTahun);
        schedule = await getDailyScheduleFromDb(kabkota, targetDate);
      } catch (syncErr) {
        console.error(`[Auto-sync] Failed to sync schedule on-the-fly:`, syncErr.message);
      }
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: `Prayer schedule for ${kabkota} on ${tanggal} not found and could not be automatically synced.`
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve daily schedule.',
      error: error.message
    });
  }
};
