import { Pill } from "../../../components/common/Pill";
import { ASSETS, JADWAL_KHOTIB } from "../../../utils/constants";
import { motion } from "framer-motion";

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
  const currentKhotib = JADWAL_KHOTIB[0];

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
          text={`Jum'at, ${currentKhotib.date}`}
          className="bg-brand-primary text-brand-secondary border-none shadow-md inline-flex px-8 py-2 text-lg font-extrabold uppercase tracking-wider"
        />
      </motion.div>

      <div className="flex flex-row gap-8 w-full max-w-5xl mx-auto items-stretch">
        {/* Profil Khotib Utama */}
        <motion.div className="flex-none w-1/3" variants={itemVariants}>
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative group">
            <img
              src={ASSETS.ustadz}
              alt={currentKhotib.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent p-6 text-center">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
                Khotib Hari Ini
              </p>
              <h3 className="text-xl font-semibold text-gray-900">
                {currentKhotib.name}
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
              "{currentKhotib.tema || "Keutamaan Sedekah di Bulan Suci"}"
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
              {JADWAL_KHOTIB.slice(1, 4).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 py-3 border-b border-brand-border border-dotted last:border-b-0"
                >
                  <div className="text-sm font-extrabold text-brand-secondary bg-brand-primary/20 px-4 py-2 rounded-xl w-32 text-center shadow-inner">
                    {item.date}
                  </div>
                  <div className="text-lg font-bold text-brand-secondary/80">
                    {item.name}
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
