import { RUNNING_TEXT } from '../../utils/constants';

export function FooterMarquee() {
  // Gabungkan semua teks dengan pemisah titik emas
  const marqueeText = RUNNING_TEXT.join(' • ');

  return (
    <div className="w-full bg-brand-secondary text-white py-3 shadow-inner relative overflow-hidden flex items-center border-t-4 border-brand-primary">
      {/* Efek gradient di pinggir agar teks yang masuk/keluar terlihat halus (opsional) */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-brand-secondary to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-brand-secondary to-transparent z-10"></div>
      
      <div className="whitespace-nowrap flex animate-[marquee_20s_linear_infinite]">
        <span className="text-2xl font-medium tracking-wide mx-4">
          {marqueeText}
        </span>
        {/* Duplicate text for seamless scrolling */}
        <span className="text-2xl font-medium tracking-wide mx-4">
          • {marqueeText}
        </span>
      </div>
    </div>
  );
}
