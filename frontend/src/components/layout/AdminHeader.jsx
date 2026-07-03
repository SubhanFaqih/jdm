import { useTheme } from '../../context/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveProfile } from '../../hooks/useActiveProfile';

export function AdminHeader() {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { activeProfile } = useActiveProfile();
  const title = activeProfile?.nama_masjid || 'Admin Panel';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

        {user && (
          <>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-850"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
