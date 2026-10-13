# JDM Server

Fondasi backend layered: TypeScript, Express 5, PostgreSQL, dan Drizzle.

## Menjalankan

```sh
npm install
cp .env.example .env
# Sesuaikan DATABASE_URL dengan PostgreSQL lokal milikmu.
npm run dev
```

Port default 3000. GET `/` mempertahankan response Hello World; GET
`/api/health` memberikan `{ "success": true, "data": { "status": "ok" } }`.
Health hanya memeriksa proses HTTP, bukan koneksi database. Pool PostgreSQL
membuka koneksi saat query pertama. PostgreSQL belum diinstal/dijalankan oleh
boilerplate ini.

## Tanggung jawab folder

```text
src/
  config/         Validasi environment
  routes/         URL, middleware, dan controller
  controllers/    Request dan response HTTP
  services/       Aturan bisnis dan koordinasi use case
  repositories/   Query database menggunakan Drizzle
  validators/     Schema input fitur (body, params, query)
  clients/        Integrasi API eksternal
  db/schema/     Definisi tabel *.schema.ts
  db/index.ts    PostgreSQL pool dan Drizzle
  middleware/    Penanganan request lintas fitur
  errors/        Error aplikasi
  app.ts         Factory createApp() tanpa membuka port
  server.ts      Listener dan shutdown
drizzle/         Hasil generate migration; jangan edit metadata manual
```

Alur fitur: route → controller → service → repository → database.
Validasi input dilakukan sebelum use case dijalankan. Service menerima data
biasa, tidak menerima Express Request/Response. Repository tidak menentukan
HTTP status. Health yang hanya mengembalikan status proses tidak memerlukan
service/repository kosong.

Folder dengan `.gitkeep` disiapkan untuk latihan fitur pertama; belum ada
schema bisnis, autentikasi, job, scheduler, atau pemindahan data MongoDB.
Backend lama di `../backend` tetap terpisah.

## Pemeriksaan dan build

```sh
npm run typecheck
npm run build
npm start
```

## Migration

Setelah tabel pertama dibuat di `src/db/schema/*.schema.ts`:

```sh
npm run db:generate
# Review SQL yang dihasilkan sebelum menerapkannya.
npm run db:migrate
npm run db:studio
```

Schema sengaja kosong sampai desain fitur pertama dibahas. `db:generate`
belum dapat menghasilkan migration tabel pada tahap ini. `db:migrate`
mengubah database yang ditunjuk DATABASE_URL; tidak dijalankan otomatis
ketika server mulai.

Referensi konfigurasi: https://orm.drizzle.team/docs/drizzle-config-file
