import { CleanCard } from '../common/CleanCard';
import { Pill } from '../common/Pill';
import { JADWAL_SHOLAT } from '../../utils/constants';

export function Sidebar() {
  return (
    <div className="w-[300px] h-full flex flex-col gap-6 py-8 pr-8 z-20">
      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-slate-800">Jadwal Sholat</h2>
        <p className="text-sm text-slate-500">Wilayah Kota Depok</p>
      </div>

      {JADWAL_SHOLAT.map((jadwal, index) => (
        <div key={index} className="flex-1 relative flex flex-col mt-4">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <Pill text={jadwal.name} className="px-8 py-2 text-sm shadow-sm" />
          </div>
          
          <CleanCard className="flex-1 w-full flex items-center justify-center pt-6 pb-4 px-4 text-center">
            <span className="text-5xl font-mono font-bold text-slate-800 tracking-wider">
              {jadwal.time}
            </span>
          </CleanCard>
        </div>
      ))}
    </div>
  );
}
