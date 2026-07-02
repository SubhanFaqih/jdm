import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengecek sesi user saat pertama kali aplikasi dibuka
  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'same-origin'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUser(json.data);
        }
      }
    } catch (error) {
      console.error('Gagal memverifikasi sesi login:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fungsi untuk login
  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'same-origin'
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Gagal login');
    }

    setUser(json.data);
    return json.data;
  };

  // Fungsi untuk logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      });
    } catch (error) {
      console.error('Gagal logout di server:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
