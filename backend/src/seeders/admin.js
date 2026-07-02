import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import User from '../models/User.js';

// Load environment variables dari folder backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    // Ambil data admin dari parameter CLI (node src/seeders/admin.js [username] [password] [nama])
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Administrator';

    console.log('Menghubungkan ke MongoDB...');
    await connectDB();

    console.log(`Memeriksa apakah user "${username}" sudah ada...`);
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      console.log(`[Error] User dengan username "${username}" sudah terdaftar di database.`);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`Membuat akun admin baru...`);
    const newAdmin = new User({
      username,
      password,
      name,
      role: 'admin'
    });

    await newAdmin.save();
    console.log(`\n======================================================`);
    console.log(`[Sukses] Akun admin berhasil dibuat!`);
    console.log(`Username : ${username}`);
    console.log(`Password : ${password}`);
    console.log(`Nama     : ${name}`);
    console.log(`======================================================\n`);

    await mongoose.connection.close();
    console.log('Koneksi database ditutup.');
    process.exit(0);
  } catch (error) {
    console.error('Terjadi kesalahan saat seeding:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
