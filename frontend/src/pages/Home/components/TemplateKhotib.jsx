import { Pill } from "../../../components/common/Pill";
import { motion } from "framer-motion";
import { useActiveKhotib } from "../../../hooks/useActiveKhotib";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
};

export function TemplateKhotib() {
  const { currentKhotib, nextKhotibList, isLoading } = useActiveKhotib();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium">
        Memuat jadwal khotib...
      </div>
    );
  }

  const formatDate = (dateString, includeWeekday = false) => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--';
      return new Intl.DateTimeFormat('id-ID', {
        weekday: includeWeekday ? 'long' : undefined,
        day: 'numeric',
        month: 'long',
      }).format(date);
    } catch {
      return '--';
    }
  };

  const khotibHariIni = {
    formattedDate: currentKhotib?.tanggal ? formatDate(currentKhotib.tanggal, true) : '--',
    nama: currentKhotib?.ustadz_id?.nama || '--',
    foto: currentKhotib?.ustadz_id?.foto_url || '',
    tema: currentKhotib?.tema || '--'
  };

  const listMendatang = nextKhotibList && nextKhotibList.length > 0
    ? nextKhotibList.map(item => ({
      dateStr: formatDate(item.tanggal),
      nama: item.ustadz_id?.nama || '--'
    }))
    : [
      { dateStr: '--', nama: '--' },
      { dateStr: '--', nama: '--' },
      { dateStr: '--', nama: '--' }
    ];

  return (
    <motion.div
      className="w-full h-full flex flex-col justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <motion.div className="text-center mb-6" variants={itemVariants}>
        <h2 className="text-5xl font-extrabold text-brand-secondary tracking-tight mb-3">
          Jadwal Khotib Jum'at
        </h2>
        <Pill
          text={khotibHariIni.formattedDate}
          className="bg-brand-primary text-brand-secondary border-none shadow-md inline-flex px-8 py-2 text-lg font-extrabold uppercase tracking-wider"
        />
      </motion.div>

      <div className="flex flex-row gap-8 w-full max-w-5xl mx-auto items-stretch">
        {/* Profil Khotib Utama */}
        <motion.div className="flex-none w-1/3" variants={itemVariants}>
          {/* Card style matched with the schedules card (rounded-3xl, border-brand-primary/10, shadow-sm) */}
          <div className="w-full h-full bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm border border-brand-primary/10 relative group min-h-[350px]">
            {khotibHariIni.foto ? (
              <img
                src={khotibHariIni.foto}
                alt={khotibHariIni.nama}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}

            {/* Floating Glassmorphic Info Card matching the design system */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-brand-primary/10 text-center flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-extrabold mb-1">
                Khotib Hari Ini
              </p>
              <h3 className="text-lg font-extrabold text-brand-secondary leading-tight line-clamp-1">
                {khotibHariIni.nama}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Info & List Jadwal */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Section Tema */}
          <motion.div
            className="bg-white/80 backdrop-blur-md border border-brand-primary/10 p-6 rounded-3xl shadow-sm relative overflow-hidden"
            variants={itemVariants}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl -mr-4 -mt-4"></div>
            <p className="text-brand-secondary/60 font-bold uppercase text-xs tracking-widest mb-2 relative z-10">
              Tema Khotbah
            </p>
            <h4 className="text-3xl font-bold text-brand-secondary leading-snug relative z-10">
              {khotibHariIni.tema && khotibHariIni.tema !== '--' ? `"${khotibHariIni.tema}"` : '--'}
            </h4>
          </motion.div>

          {/* List Jadwal */}
          <motion.div
            className="bg-white/70 backdrop-blur-md border border-brand-primary/10 p-6 rounded-3xl shadow-sm flex-1 flex flex-col"
            variants={itemVariants}
          >
            <h4 className="text-xl font-bold text-brand-secondary mb-4 flex items-center gap-3">
              <span className="w-2 h-6 bg-brand-primary rounded-full"></span>
              Jadwal Mendatang
            </h4>
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {listMendatang.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 py-3 border-b border-brand-border border-dotted last:border-b-0"
                >
                  <div className="text-sm font-extrabold text-brand-secondary bg-brand-primary/20 px-4 py-2 rounded-xl w-36 text-center shadow-inner">
                    {item.dateStr}
                  </div>
                  <div className="text-lg font-bold text-brand-secondary">
                    {item.nama}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
