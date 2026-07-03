import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  return (
    <div className="admin-theme flex h-screen w-screen overflow-hidden bg-brand-bg-primary text-slate-800 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader />
        
        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
