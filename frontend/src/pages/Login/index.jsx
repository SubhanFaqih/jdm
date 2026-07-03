import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useActiveProfile } from '../../hooks/useActiveProfile';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeProfile } = useActiveProfile();
  const title = activeProfile?.nama_masjid || 'Admin Panel';

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Jika user sudah login, redirect langsung ke dashboard admin
  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan password wajib diisi');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Username atau password salah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-theme relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      {/* Background Ornaments / Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 dark:bg-brand-primary/5"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 dark:bg-brand-primary/5"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md transition-all duration-300">
        
        {/* Top Header Card */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary mb-4 animate-bounce">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Admin Panel
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {title}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-6">
          
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 p-4 text-sm text-red-800 border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 rounded-xl transition-all animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk Ke Dashboard</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
