import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  HeartHandshake, 
  Wallet, 
  Building2, 
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { 
    label: 'Masjid', 
    icon: Building2,
    subItems: [
      { path: '/admin/profile', label: 'Profile Masjid', icon: Building2 },
      { path: '/admin/ustadz', label: 'Ustadz', icon: Users },
      { path: '/admin/khotib', label: 'Jadwal Khotib', icon: CalendarDays },
      { path: '/admin/hadist', label: 'Hadist Harian', icon: BookOpen },
    ]
  },
  { 
    label: 'Keuangan', 
    icon: Wallet,
    subItems: [
      { path: '/admin/kas', label: 'Laporan Kas', icon: Wallet },
      { path: '/admin/donasi', label: 'Program Donasi', icon: HeartHandshake },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList }
    ]
  }
];

export function AdminSidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  // Auto-open menu if child is active
  useEffect(() => {
    const currentPath = location.pathname;
    navItems.forEach(item => {
      if (item.subItems) {
        const isChildActive = item.subItems.some(sub => currentPath === sub.path || currentPath.startsWith(sub.path + '/'));
        if (isChildActive) {
          setOpenMenus(prev => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full transition-colors duration-200">
      {/* Brand / Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold font-heading text-brand-primary">
          Admin Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          if (item.subItems) {
            const isOpen = openMenus[item.label];
            const isAnyChildActive = item.subItems.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/'));
            
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors duration-150 ${
                    isAnyChildActive
                      ? 'bg-brand-primary/5 text-brand-primary dark:bg-brand-primary/10 dark:text-brand-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {isOpen && (
                  <div className="pl-4 pr-2 space-y-1 mt-1">
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                            isActive
                              ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {sub.icon && <sub.icon className="w-4 h-4" />}
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <NavLink 
          to="/" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="text-sm">Back to Display</span>
        </NavLink>
      </div>
    </aside>
  );
}
