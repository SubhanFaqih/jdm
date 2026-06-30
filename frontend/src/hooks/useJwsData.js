import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { jwsService } from '../services/baseCrudService';
import { useActiveProfile } from './useActiveProfile';

export function useJwsData() {
  const getTodayStr = () => {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [todayStr, setTodayStr] = useState(getTodayStr());

  useEffect(() => {
    // Check every minute if the day has changed to automatically fetch new data without refreshing
    const interval = setInterval(() => {
      const newTodayStr = getTodayStr();
      if (newTodayStr !== todayStr) {
        setTodayStr(newTodayStr);
      }
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, [todayStr]);

  // Fetch active profile
  const { activeProfile } = useActiveProfile();
  const kota = activeProfile ? activeProfile.kota : 'Memuat...';

  // Fetch JWS
  const { data: jwsData, isLoading, isError } = useQuery({
    queryKey: ['jws', activeProfile?._id || activeProfile?.id, todayStr],
    queryFn: async () => await jwsService.getDailySchedule(activeProfile?._id || activeProfile?.id, todayStr),
    enabled: !!activeProfile,
    staleTime: Infinity, // never stale during the same day
    retry: false, // jangan otomatis retry bila API error 404
  });

  const mappedJadwal = [
    { name: 'Subuh', time: jwsData?.subuh || '--:--' },
    { name: 'Syuruq', time: jwsData?.terbit || jwsData?.syuruq || '--:--' },
    { name: 'Dzuhur', time: jwsData?.dzuhur || '--:--' },
    { name: 'Ashar', time: jwsData?.ashar || '--:--' },
    { name: 'Maghrib', time: jwsData?.maghrib || '--:--' },
    { name: 'Isya', time: jwsData?.isya || '--:--' },
  ];

  return {
    mappedJadwal,
    jwsData,
    kota,
    isLoading,
    isError,
    activeProfile,
    todayStr
  };
}
