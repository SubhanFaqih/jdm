import { useQuery } from '@tanstack/react-query';
import { jwsService } from '../services/baseCrudService';
import { useActiveProfile } from './useActiveProfile';
import { useTime } from '../context/TimeContext';

export function useJwsData() {
  const { todayStr } = useTime();
  
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
