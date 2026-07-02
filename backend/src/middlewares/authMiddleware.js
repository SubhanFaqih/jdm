import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Dapatkan token dari HttpOnly Cookies (prioritas utama)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback: Dapatkan token dari Authorization header (untuk keperluan debugging/Postman)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Jika token tidak ada
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak, token tidak tersedia'
    });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari user di database berdasarkan ID dari token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak, pengguna tidak ditemukan'
      });
    }

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak, token tidak valid'
    });
  }
};
