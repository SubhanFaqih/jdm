import PrayerSchedule from '../models/Jws.js';

/**
 * Fetch monthly prayer schedule from equran.id API
 * 
 * Endpoint: POST https://equran.id/api/v2/shalat
 * Payload: { provinsi, kabkota, bulan, tahun }
 */
export const fetchMonthlySchedule = async (provinsi, kabkota, bulan, tahun) => {
  try {
    const payload = { provinsi, kabkota };
    if (bulan !== undefined) payload.bulan = Number(bulan);
    if (tahun !== undefined) payload.tahun = Number(tahun);

    const response = await fetch('https://equran.id/api/v2/shalat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`External API returned status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.code !== 200) {
      throw new Error(result.message || 'Failed to fetch schedule from equran.id');
    }

    return result.data;
  } catch (error) {
    console.error('Error in equranService:', error.message);
    throw error;
  }
};

/**
 * Sync monthly prayer schedule from equran.id and save it to local MongoDB
 */
export const syncPrayerSchedule = async (provinsi, kabkota, bulan, tahun) => {
  const apiData = await fetchMonthlySchedule(provinsi, kabkota, bulan, tahun);

  if (!apiData || !apiData.jadwal || apiData.jadwal.length === 0) {
    throw new Error('No schedule found from the external API.');
  }

  const bulkOps = apiData.jadwal.map((item) => {
    const dateObj = new Date(`${item.tanggal_lengkap}T00:00:00Z`);

    return {
      updateOne: {
        filter: { 
          kabkota: apiData.kabkota, 
          tanggal_lengkap: dateObj 
        },
        update: {
          $set: {
            provinsi: apiData.provinsi,
            kabkota: apiData.kabkota,
            bulan: Number(apiData.bulan),
            tahun: Number(apiData.tahun),
            bulan_nama: apiData.bulan_nama,
            tanggal: Number(item.tanggal),
            tanggal_lengkap: dateObj,
            hari: item.hari,
            imsak: item.imsak,
            subuh: item.subuh,
            terbit: item.terbit,
            dhuha: item.dhuha,
            dzuhur: item.dzuhur,
            ashar: item.ashar,
            maghrib: item.maghrib,
            isya: item.isya
          }
        },
        upsert: true
      }
    };
  });

  const bulkResult = await PrayerSchedule.bulkWrite(bulkOps);

  return {
    provinsi: apiData.provinsi,
    kabkota: apiData.kabkota,
    bulan: apiData.bulan_nama,
    tahun: apiData.tahun,
    totalDays: apiData.jadwal.length,
    upsertedCount: bulkResult.upsertedCount,
    modifiedCount: bulkResult.modifiedCount
  };
};

/**
 * Get daily prayer schedule from local MongoDB by date
 */
export const getDailyScheduleFromDb = async (kabkota, targetDate) => {
  return await PrayerSchedule.findOne({
    kabkota: { $regex: new RegExp(`^${kabkota}$`, 'i') },
    tanggal_lengkap: targetDate
  });
};

/**
 * Check if a schedule already exists in local DB for a given month and year
 */
export const checkExistingSchedule = async (kabkota, bulan, tahun) => {
  return await PrayerSchedule.findOne({
    kabkota: { $regex: new RegExp(`^${kabkota}$`, 'i') },
    bulan,
    tahun
  });
};
