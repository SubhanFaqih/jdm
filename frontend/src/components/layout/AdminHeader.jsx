import { useTheme } from '../../context/ThemeProvider';
import { Sun, Moon, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/admin': 'Dashboard Overview',
  '/admin/ustadz': 'Manajemen Ustadz',
  '/admin/khotib': 'Jadwal Khotib Jumat',
  '/admin/donasi': 'Program Donasi',
  '/admin/kas': 'Laporan Kas Masjid',
  '/admin/profile': 'Profile & Pengaturan Masjid',
  '/admin/hadist': 'Manajemen Hadist Harian',
};

export function AdminHeader() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Admin Panel';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h2>

      <div className="flex items-center gap-4">
        <button 
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
