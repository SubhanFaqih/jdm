export function FooterMarquee({ activeProfile }) {
  // Gabungkan semua teks dengan pemisah titik emas, gunakan data dari activeProfile jika ada
  const marqueeText = activeProfile?.running_text?.trim() || '';

  // Hitung durasi animasi secara dinamis agar kecepatan gerak (ritme) selalu konsisten
  // Jumlah karakter dibagi dengan kecepatan tertentu (misal: 6 karakter per detik)
  const charactersPerSecond = 6; 
  const duration = Math.max(20, marqueeText.length / charactersPerSecond);

  return (
    <div className="w-full bg-brand-secondary text-white h-14 shadow-inner relative overflow-hidden flex items-center border-t-4 border-brand-primary">
      {/* Efek gradient di pinggir agar teks yang masuk/keluar terlihat halus (opsional) */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-brand-secondary to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-brand-secondary to-transparent z-10"></div>

      <div 
        className="absolute whitespace-nowrap flex items-center h-full animate-[marquee_linear_infinite]"
        style={{ animationDuration: `${duration}s` }}
      >
        <span className="text-2xl font-medium tracking-wide mx-4">
          {marqueeText}
        </span>
      </div>
    </div>
  );
}
