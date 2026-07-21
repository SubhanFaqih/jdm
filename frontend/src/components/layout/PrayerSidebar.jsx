import { useJwsData } from '../../hooks/useJwsData';
import { usePrayerState } from '../../context/PrayerStateContext';

export function PrayerSidebar() {
  const { mappedJadwal } = useJwsData();
  const { state: prayerState, prayer, nextPrayer } = usePrayerState();

  return (
    <div className="w-full h-full flex flex-col pt-2">
      {/* Daftar Jadwal Sholat */}
      <div className="flex-1 flex flex-col justify-between gap-4 py-2 relative">
        {mappedJadwal.map((jadwal, index) => {
          const jadwalKey = jadwal.name.toLowerCase();
          const isActive = prayerState !== 'IDLE' && prayer === jadwalKey;
          const isNext = prayerState === 'IDLE' && nextPrayer === jadwalKey;

          let cardClass = "bg-white border-brand-primary/40 text-brand-secondary";
          let labelClass = "text-brand-secondary/70";
          let timeClass = "text-brand-secondary";

          if (isActive) {
            // Active state (Adzan / Iqomah / Sholat) -> Intense highlight with pulse
            cardClass = "bg-gradient-to-r from-brand-secondary to-emerald-950 border-brand-primary text-white scale-[1.04] shadow-lg shadow-brand-secondary/20 animate-pulse";
            labelClass = "text-brand-primary font-bold";
            timeClass = "text-white font-mono font-bold";
          } else if (isNext) {
            // Next prayer -> Gentle glowing highlight
            cardClass = "bg-amber-50/90 border-brand-primary text-brand-secondary scale-[1.02] shadow-md";
            labelClass = "text-brand-primary font-semibold flex items-center";
            timeClass = "text-brand-secondary font-mono font-bold";
          }

          return (
            <div 
              key={index} 
              className={`flex-1 flex items-center justify-between px-8 rounded-full border-4 shadow-sm transition-all duration-300 ${cardClass}`}
            >
              <span className={`text-2xl font-semibold flex items-center ${labelClass}`}>
                {jadwal.name}
              </span>
              <span className={`text-4xl font-mono font-bold tracking-wider ${timeClass}`}>
                {jadwal.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
