import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'jdm_offline_schedules';

export function useOfflineSchedule() {
  const [offlineSchedules, setOfflineSchedules] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveSchedule = useCallback((kabkota, dateStr, scheduleData) => {
    if (!kabkota || !dateStr || !scheduleData) return;
    const key = `${kabkota.toLowerCase()}_${dateStr}`;
    setOfflineSchedules((prev) => {
      const updated = { ...prev, [key]: scheduleData };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      return updated;
    });
  }, []);

  const getSchedule = useCallback((kabkota, dateStr) => {
    if (!kabkota || !dateStr) return null;
    const key = `${kabkota.toLowerCase()}_${dateStr}`;
    return offlineSchedules[key] || null;
  }, [offlineSchedules]);

  // Clean old schedules periodically to prevent localStorage bloat
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const schedules = JSON.parse(stored);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updated = {};
      let changed = false;

      Object.keys(schedules).forEach((key) => {
        // key format: "city_YYYY-MM-DD"
        const parts = key.split('_');
        if (parts.length < 2) return;
        const dateStr = parts[parts.length - 1];
        const dateObj = new Date(dateStr);
        // Keep schedules from yesterday onwards to be safe
        if (!isNaN(dateObj.getTime()) && dateObj.getTime() >= today.getTime() - 24 * 60 * 60 * 1000) {
          updated[key] = schedules[key];
        } else {
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setOfflineSchedules(updated);
      }
    } catch (e) {
      console.error('Error cleaning offline schedules:', e);
    }
  }, []);

  return {
    saveSchedule,
    getSchedule
  };
}
