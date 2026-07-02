import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Tampilkan loading screen sementara saat mengecek sesi login
  if (loading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Memverifikasi Sesi...
        </p>
      </div>
    );
  }

  // Jika tidak ada user (belum login), redirect ke halaman login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Jika sudah login, tampilkan halaman admin yang dituju
  return children;
}
