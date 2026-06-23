import { MASJID_INFO } from '../../utils/constants';
import { useCurrentTime } from '../../hooks/useCurrentTime';

export function Header() {
  const { timeString, dateStringGregorian, dateStringHijri } = useCurrentTime();

  return (
    <div className="w-full flex justify-between items-center px-12 pt-10 pb-4 border-b-2 border-brand-primary/20">
      <div className="flex items-center gap-6">
        {/* Logo Masjid SVG */}
        <div className="text-brand-primary flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C10.89 2 10 2.89 10 4V4.5C8 5.17 6.5 6.96 6.5 9.5V13H5V15H6.5V20H10V16H14V20H17.5V15H19V13H17.5V9.5C17.5 6.96 16 5.17 14 4.5V4C14 2.89 13.11 2 12 2ZM12 4A1 1 0 0 1 13 5A1 1 0 0 1 12 6A1 1 0 0 1 11 5A1 1 0 0 1 12 4ZM9.5 7H14.5A2.5 2.5 0 0 1 17 9.5V13H7V9.5A2.5 2.5 0 0 1 9.5 7Z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-5xl font-bold text-brand-secondary font-heading tracking-tight leading-tight">
            {MASJID_INFO.name}
          </h1>
          <p className="text-brand-secondary/80 font-medium text-lg mt-1 whitespace-pre-line">
            {MASJID_INFO.address}
          </p>
        </div>
      </div>
      
      {/* Bagian Kanan: Jam Utama & Tanggal (dipindah dari Sidebar) */}
      <div className="flex items-center gap-6 text-right">
        <div className="flex flex-col items-end">
          <p className="text-brand-secondary font-semibold text-lg">{dateStringGregorian}</p>
          <p className="text-brand-secondary/70 text-md">{dateStringHijri}</p>
        </div>
        <div className="text-6xl font-mono font-bold text-brand-primary tracking-widest drop-shadow-sm">
          {timeString}
        </div>
      </div>
    </div>
  );
}
