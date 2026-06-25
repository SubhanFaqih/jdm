import { Users, CalendarDays, Wallet, HeartHandshake } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'Total Ustadz', value: '24', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Jadwal Khotib', value: '12', icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Kas', value: 'Rp 45.000.000', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Program Donasi', value: '4 Aktif', icon: HeartHandshake, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Selamat Datang di Admin Panel
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Ini adalah versi dummy dari sistem manajemen data masjid. Anda dapat menggunakan sidebar di sebelah kiri untuk menavigasi ke pengaturan masing-masing modul.
        </p>
      </div>
    </div>
  );
}
