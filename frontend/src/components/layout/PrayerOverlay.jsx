import { motion } from 'framer-motion';
import { ASSETS } from '../../utils/constants';
import { useActiveProfile } from '../../hooks/useActiveProfile';
import { FooterMarquee } from './FooterMarquee';

export function PrayerOverlay({ state, prayer, remaining }) {
  const { activeProfile } = useActiveProfile();

  if (state === 'IDLE') return null;

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getOverlayTitle = () => {
    const prayerName = prayer ? prayer.charAt(0).toUpperCase() + prayer.slice(1) : '';
    switch (state) {
      case 'ADZAN':
        return `ADZAN ${prayerName.toUpperCase()}`;
      case 'IQOMAH_COUNTDOWN':
        return `IQOMAH ${prayerName.toUpperCase()} DALAM`;
      case 'SHOLAT':
        return `SHOLAT ${prayerName.toUpperCase()}`;
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-brand-bg-primary text-brand-secondary"
    >
      {/* Background Image (Islamic Pattern - same as main screen) */}
      <div
        className="absolute inset-0 z-0 bg-repeat opacity-25"
        style={{ backgroundImage: `url(${ASSETS.background})`, backgroundSize: '400px' }}
      />

      {/* Top spacing to push content down or can hold header if wanted, but pure layout is cleaner */}
      <div className="h-16 flex-none relative z-10" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-7xl bg-brand-secondary text-white rounded-3xl p-16 md:p-20 shadow-2xl border-4 border-brand-primary flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Title */}
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-wider font-heading uppercase text-brand-primary drop-shadow mb-10">
            {getOverlayTitle()}
          </h2>

          {/* Content changing based on state */}
          {state !== 'SHOLAT' ? (
            <div className="flex flex-col items-center">
              {/* Countdown Timer */}
              <div className="text-[11rem] md:text-[12.5rem] font-mono font-bold leading-none tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                {formatTime(remaining)}
              </div>
              <p className="text-xl md:text-2xl text-white/70 font-medium tracking-wide mt-8 uppercase">
                {state === 'ADZAN' ? 'Harap tenang, Adzan sedang berkumandang' : 'Mempersiapkan diri untuk sholat berjamaah'}
              </p>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center">
              {/* Sholat in Progress message */}
              <div className="text-5xl md:text-6xl font-bold tracking-wide text-white animate-pulse">
                HARAP LURUS & RAPATKAN SHAF
              </div>
              <p className="text-2xl md:text-3xl text-white/80 font-medium tracking-widest mt-8 uppercase">
                Sholat Sedang Berlangsung
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer running text marquee (Hidden during SHOLAT state) */}
      <div className="w-full flex-none relative z-20">
        {state !== 'SHOLAT' ? (
          <FooterMarquee activeProfile={activeProfile} />
        ) : (
          /* Empty spacing to match layout structure when marquee is hidden */
          <div className="h-14" />
        )}
      </div>
    </motion.div>
  );
}
