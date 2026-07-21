import { Header } from '../../components/layout/Header';
import { PrayerSidebar } from '../../components/layout/PrayerSidebar';
import { FooterMarquee } from '../../components/layout/FooterMarquee';

import { TemplateKeuangan } from './components/TemplateKeuangan';
import { TemplateKhotib } from './components/TemplateKhotib';
import { TemplateHadist } from './components/TemplateHadist';

import { useTemplateCycle } from '../../hooks/useTemplateCycle';
import { ASSETS } from '../../utils/constants';
import { AnimatePresence } from 'framer-motion';
import { useActiveProfile } from '../../hooks/useActiveProfile';
import { useActiveHadist } from '../../hooks/useActiveHadist';
import { useEffect } from 'react';
import { usePrayerState } from '../../context/PrayerStateContext';
import { PrayerOverlay } from '../../components/layout/PrayerOverlay';

export function Home() {
  // 3 templates, switch every 15 seconds (15000 ms)
  const templateIndex = useTemplateCycle(3, 15000);

  // Fetch active profile
  const { activeProfile } = useActiveProfile();
  const { activeHadist, refetch: refetchHadist } = useActiveHadist();

  // Get active prayer state
  const { state: prayerState, prayer, remaining } = usePrayerState();

  useEffect(() => {
    if (templateIndex === 1) {
      refetchHadist();
    }
  }, [templateIndex, refetchHadist])

  return (
    <div
      className="relative w-screen h-screen flex flex-col overflow-hidden bg-brand-bg-primary text-brand-secondary"
    >
      {/* Background Image Global (Islamic Pattern) */}
      <div
        className="absolute inset-0 z-0 bg-repeat opacity-25"
        style={{ backgroundImage: `url(${ASSETS.background})`, backgroundSize: '400px' }}
      />

      {/* Top Header */}
      <div className="relative z-10 flex-none w-full">
        <Header activeProfile={activeProfile} />
      </div>

      {/* Main Body */}
      <div className="relative z-10 flex-1 flex flex-row overflow-hidden w-full max-w-[1920px] mx-auto px-10 py-6 gap-10">

        {/* Kolom Kiri: Sidebar Jam & Jadwal Sholat */}
        <div className="w-[380px] flex-none h-full">
          <PrayerSidebar />
        </div>

        {/* Kolom Kanan: Area Template Dinamis */}
        <div className="flex-1 flex items-center justify-center h-full overflow-hidden bg-transparent">
          <div className="w-full h-full max-w-7xl max-h-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {templateIndex === 0 && <TemplateKeuangan key="keuangan" />}
              {templateIndex === 1 && <TemplateKhotib key="khotib" />}
              {templateIndex === 2 && <TemplateHadist key="hadist" activeHadist={activeHadist} />}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Bottom Footer Marquee */}
      <div className="relative z-20 flex-none w-full">
        <FooterMarquee activeProfile={activeProfile} />
      </div>

      {/* Fullscreen Prayer State Overlay */}
      <AnimatePresence>
        {prayerState !== 'IDLE' && (
          <PrayerOverlay
            state={prayerState}
            prayer={prayer}
            remaining={remaining}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
