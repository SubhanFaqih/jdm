import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Auth user & get token (set HttpOnly cookie)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validasi input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username dan password wajib diisi'
    });
  }

  try {
    // Cari user di database
    const user = await User.findOne({ username });

    // Jika user ditemukan dan password cocok
    if (user && (await user.matchPassword(password))) {
      // Buat JWT Token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token aktif selama 7 hari
      });

      // Simpan JWT di dalam HttpOnly Cookie
      res.cookie('token', token, {
        httpOnly: true, // Proteksi dari XSS (JS tidak bisa membaca cookie ini)
        secure: process.env.NODE_ENV === 'production', // Hanya terkirim di HTTPS pada mode produksi
        sameSite: 'lax', // Proteksi CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
      });

      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          _id: user._id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login'
    });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0), // Set expired langsung agar cookie dihapus browser
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat logout'
    });
  }
});

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
});

export default router;
