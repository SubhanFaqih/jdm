import { useJwsData } from '../../hooks/useJwsData';

export function PrayerSidebar() {
  const { mappedJadwal } = useJwsData();

  return (
    <div className="w-full h-full flex flex-col pt-2">
      {/* Daftar Jadwal Sholat */}
      <div className="flex-1 flex flex-col justify-between gap-4 py-2 relative">
        {mappedJadwal.map((jadwal, index) => {
          return (
            <div 
              key={index} 
              className="flex-1 flex items-center justify-between px-8 rounded-full border-4 shadow-sm transition-all duration-300 bg-white border-brand-primary/40"
            >
              <span className="text-2xl font-semibold text-brand-secondary/70">
                {jadwal.name}
              </span>
              <span className="text-4xl font-mono font-bold tracking-wider text-brand-secondary">
                {jadwal.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
