import { KEUANGAN_BARU } from "../../../utils/constants";
import { motion } from "framer-motion";

const FinanceItem = ({ label, amount, formatFn }) => (
  <div className="flex justify-between items-center py-2 border-b border-brand-border border-dotted last:border-b-0">
    <span className="text-lg text-brand-secondary/80 font-medium">{label}</span>
    <span className="text-lg text-brand-secondary font-bold tabular-nums">
      {formatFn(amount)}
    </span>
  </div>
);

// Variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export function TemplateKeuangan() {
  const { totalSaldo, pemasukan, pengeluaran, targetDonasi, terkumpulDonasi } =
    KEUANGAN_BARU;

  const formatRp = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  // Kalkulasi Progress
  const persen = Math.min((terkumpulDonasi / targetDonasi) * 100, 100);
  const kekurangan = Math.max(targetDonasi - terkumpulDonasi, 0);

  return (
    <motion.div
      className="w-full h-full flex flex-col justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {/* Header Total Saldo */}
      <motion.div className="text-center mb-6" variants={itemVariants}>
        <p className="text-sm uppercase tracking-widest text-brand-secondary/60 font-bold mb-1">
          Total Saldo
        </p>
        <h1 className="text-6xl font-extrabold text-brand-secondary tracking-tight">
          <span className="text-brand-primary mr-2">Rp</span>
          {new Intl.NumberFormat("id-ID").format(totalSaldo)}
        </h1>
      </motion.div>

      <motion.div className="flex flex-row gap-8 mb-6" variants={itemVariants}>
        {/* Pemasukan Section */}
        <section className="flex-1 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-brand-primary/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-brand-primary/20">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <h3 className="text-2xl font-bold text-brand-secondary">
              Pemasukan
            </h3>
          </div>
          <div className="flex flex-col">
            {pemasukan.map((item, idx) => (
              <FinanceItem key={idx} {...item} formatFn={formatRp} />
            ))}
          </div>
        </section>

        {/* Pengeluaran Section */}
        <section className="flex-1 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-brand-primary/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-brand-primary/20">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            </div>
            <h3 className="text-2xl font-bold text-brand-secondary">
              Pengeluaran
            </h3>
          </div>
          <div className="flex flex-col">
            {pengeluaran.map((item, idx) => (
              <FinanceItem key={idx} {...item} formatFn={formatRp} />
            ))}
          </div>
        </section>
      </motion.div>

      {/* Progress Bar Section (Donasi) */}
      <motion.section
        className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-brand-primary/20 shadow-md relative overflow-hidden"
        variants={itemVariants}
      >
        {/* Dekorasi tipis */}
        <div className="absolute right-0 top-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl -mr-8 -mt-8"></div>

        <div className="flex justify-between items-end mb-3 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-brand-secondary mb-1">
              Progress Donasi Pembangunan
            </h3>
            <p className="text-brand-secondary/70 text-sm font-medium">
              Target: {formatRp(targetDonasi)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-brand-primary mb-1">
              {persen.toFixed(0)}%
            </p>
            <p className="text-xs font-semibold text-brand-secondary/60 uppercase">
              Kurang {formatRp(kekurangan)}
            </p>
          </div>
        </div>

        {/* Bar Visual */}
        <div className="w-full relative py-2">
          {" "}
          {/* Padding atas dikurangi karena teks melayang sudah dihapus */}
          {/* Container Progress Bar */}
          <div className="w-full h-5 bg-brand-secondary/10 rounded-full overflow-hidden relative z-10 shadow-inner border border-brand-secondary/5 backdrop-blur-sm">
            {/* Isi Progress Bar */}
            <motion.div
              className="h-full bg-brand-primary relative rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${persen}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            >
              {/* Efek Cahaya Bergerak (Premium Shimmer) */}
              <div
                className="absolute inset-0 w-full"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)",
                  animation: "shimmer 2.5s infinite linear",
                  backgroundSize: "200% 100%",
                }}
              />

              {/* Efek Glow di Ujung Bar */}
              {persen > 0 && (
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 blur-[2px] rounded-full shadow-[0_0_12px_#fff]" />
              )}
            </motion.div>
          </div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-brand-secondary/80 font-bold relative z-10">
          <span>{formatRp(terkumpulDonasi)} terkumpul</span>
          <span>{formatRp(targetDonasi)}</span>
        </div>
      </motion.section>
    </motion.div>
  );
}
