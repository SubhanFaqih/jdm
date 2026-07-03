# Dokumentasi Teknis - Jam Digital Masjid (JDM)

Dokumen ini menjelaskan struktur, alur kerja, dan arsitektur teknis dari proyek Jam Digital Masjid (JDM).

---

## 1. Pengenalan Proyek

**Jam Digital Masjid (JDM)** adalah aplikasi sistem informasi interaktif yang dirancang untuk ditampilkan pada layar (TV/Monitor) di masjid. Aplikasi ini menampilkan jadwal sholat, waktu iqomah, hadist harian, laporan kas, dan informasi relevan lainnya secara *real-time*.

### Teknologi & Library Utama:
*   **Frontend:** React.js, Vite, Tailwind CSS, React Query, React Router, Socket.io-client.
*   **Backend:** Node.js, Express.js, Mongoose (MongoDB), Socket.io, JSON Web Token (JWT), Node-Cron.
*   **Database:** MongoDB.
*   **Environment:** Docker & Docker Compose (untuk kemudahan deployment).

---

## 2. Arsitektur Sistem

Aplikasi ini menggunakan pola arsitektur **Client-Server (MERN Stack)** standar yang dipisahkan menjadi dua bagian utama: Frontend dan Backend.

*   **Frontend (Tampilan Jam & Admin Panel):**
    Bertanggung jawab untuk merender antarmuka pengguna. Berjalan sebagai *Single Page Application* (SPA). Menyediakan dua *view* utama: Layar TV Publik (Jam) dan Admin Dashboard untuk mengelola data.
*   **Backend (API & Websocket Server):**
    Bertanggung jawab mengelola logika bisnis, menyediakan REST API, mengatur komunikasi *real-time* via Websocket, dan berinteraksi dengan database MongoDB.
*   **Database (MongoDB):**
    Menyimpan seluruh data operasional seperti data masjid, kas, ustadz, jadwal sholat, dll.

### Struktur Pola Desain Backend (MVC-like)
*   **Routes:** Mendefinisikan endpoint API (contoh: `api/hadist`, `api/kas`).
*   **Controllers:** Menangani alur logika request dan response HTTP.
*   **Services:** Menangani logika bisnis yang kompleks atau pengambilan data dari API pihak ketiga (misal: API equran.id).
*   **Models:** Mendefinisikan skema dan struktur koleksi di MongoDB.

---

## 3. Alur Data (Data Flow)

Alur data di dalam aplikasi ini dirancang agar tampilan di Layar TV dapat berubah secara otomatis (*real-time*) setiap kali Admin melakukan perubahan data di Dashboard tanpa perlu me-refresh halaman TV.

### A. Fetching Data Awal
1. Saat TV Signage pertama kali dinyalakan, Frontend akan melakukan panggilan API (GET request) menggunakan **React Query**.
2. Data yang diambil mencakup: Profile Masjid, Jadwal Sholat (JWS), Hadist, dan Data Kas.
3. React Query menyimpan data ini di dalam *cache* lokal (di browser) dan menampilkannya ke komponen antarmuka.

### B. Menyimpan & Mengelola Data API
1. Saat Admin melakukan penambahan, perubahan, atau penghapusan data (POST/PUT/DELETE) melalui Admin Panel, request dikirim ke REST API Backend.
2. Backend (Mongoose) akan memperbarui data di MongoDB.

### C. Alur Real-Time (Websocket)
1. Backend dilengkapi dengan **Mongoose Global Plugin** (`mongooseSocketPlugin.js`).
2. Setiap kali ada operasi sukses pada database (seperti `save`, `findOneAndUpdate`, `findOneAndDelete`), plugin ini secara otomatis akan memicu event **Socket.io** (`data-updated`).
3. Event tersebut menyertakan nama *collection* (target) yang baru saja diubah.
4. Frontend yang terhubung via Websocket (`SocketContext.jsx`) akan mendengarkan event ini.
5. Saat menerima event, Frontend akan memberitahu **React Query** untuk membuang (*invalidate*) cache lama dan menarik ulang data (Refetch) secara otomatis.
6. Tampilan di layar TV berubah seketika mengikuti data terbaru.

---

## 4. Autentikasi (Authentication)

Sistem autentikasi dikhususkan untuk memproteksi akses menuju Admin Panel. Route publik (layar TV) dapat diakses tanpa login.

*   **Protokol:** JSON Web Token (JWT).
*   **Penyimpanan:** Token JWT **tidak** disimpan di *Local Storage*, melainkan dikirim sebagai **httpOnly Cookies**. Ini adalah praktik keamanan standar untuk mencegah serangan XSS (Cross-Site Scripting).
*   **Alur Login:**
    1. Admin memasukkan *username* dan *password* di halaman `/admin/login`.
    2. Backend memvalidasi data menggunakan `bcrypt`.
    3. Jika valid, backend meracik JWT (berisi `userId` dan *role*) dan menyisipkannya ke dalam header respons `Set-Cookie`.
*   **Proteksi Endpoint (Backend):** 
    Terdapat `authMiddleware.js` yang akan mencegat seluruh request menuju endpoint modifikasi data (POST, PUT, DELETE). Middleware ini mengekstrak JWT dari cookie, memverifikasinya, dan jika valid, meneruskan request ke Controller.
*   **Proteksi Halaman (Frontend):** 
    Terdapat komponen `ProtectedRoute.jsx` yang memastikan hanya pengguna dengan sesi (cookie) aktif yang bisa mengakses halaman dashboard admin.

---

## 5. Scheduler (Tugas Terjadwal)

Untuk memastikan data yang ditampilkan selalu baru dan tidak membebani server, JDM menggunakan mekanisme *Background Jobs* atau *Scheduler*.

*   **Library:** `node-cron`.
*   **Eksekusi:** Scheduler berjalan otomatis di belakang layar secara paralel dengan server Express.
*   **Tugas-Tugas Utama:**
    1.  **Sync Jadwal Sholat (JWS):** 
        Setiap periode tertentu (contoh: setiap tanggal 1 atau tengah malam), scheduler akan mengambil (fetch) jadwal sholat sebulan penuh dari API eksternal (misal equran.id) dan menyimpannya ke database lokal. Ini mencegah pemanggilan API eksternal secara berulang setiap kali layar TV dimuat.
    2.  **Rotasi Hadist:** 
        Secara berkala, sistem bisa menyinkronkan daftar hadist dari sumber API terbuka berdasarkan tema tertentu untuk menjaga konten layar tetap segar dan variatif.
    3.  **Pruning (Pembersihan Log):** 
        (Jika diaktifkan) Menghapus data log audit atau cache usang agar database MongoDB tidak membengkak seiring berjalannya waktu.
