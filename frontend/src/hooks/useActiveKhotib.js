import { useQuery } from "@tanstack/react-query";
import { jadwalKhotibService } from "../services/baseCrudService";

export function useActiveKhotib() {
  const { data: schedules = [], isLoading, isError } = useQuery({
    queryKey: ['jadwalKhotib'],
    queryFn: async () => await jadwalKhotibService.getAll(),
  });

  // Filter schedules that are today or in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSchedules = schedules
    .filter(s => {
      const scheduleDate = new Date(s.tanggal);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate >= today;
    })
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const currentKhotib = upcomingSchedules[0] || null;
  const nextKhotibList = upcomingSchedules.slice(1, 4);

  return {
    currentKhotib,
    nextKhotibList,
    isLoading,
    isError
  };
}