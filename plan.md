Berikut best practice untuk sistem jam masjid dengan countdown adzan → iqomah, khusus untuk 5 waktu sholat, dengan stack MERN dan requirement "tidak pernah mati" (harus reliable 24/7 tanpa restart manual):

1. Arsitektur Umum
[MongoDB] -- jadwal sholat & config iqomah
     |
[Node/Express API] -- source of truth waktu server + endpoint jadwal
     |  (Socket.io / SSE, bukan polling terus-menerus)
[React display client] -- render countdown, TAPI hitung mundur lokal

Prinsip inti: server adalah source of truth untuk waktu & jadwal, client hanya menghitung mundur secara lokal dan sinkron berkala. Jangan biarkan browser polling REST tiap detik — boros dan rawan lag kalau internet putus sebentar.

2. Struktur Data Jadwal (MongoDB)
js
// PrayerSchedule
{
  date: "2026-07-21",
  masjidId: ObjectId,
  times: {
    subuh:  "04:35",
    dzuhur: "11:52",
    ashar:  "15:15",
    maghrib:"17:48",
    isya:   "19:02"
  }
}

// IqomahConfig (per masjid, bisa beda tiap waktu)
{
  masjidId: ObjectId,
  iqomahDelay: { // dalam detik
    subuh: 15*60,
    dzuhur: 10*60,
    ashar: 10*60,
    maghrib: 5*60,
    isya: 10*60
  }
}

Isi jadwal sholat sebaiknya di-generate otomatis pakai library/API hisab (mis. Aladhan API, atau library adhan npm) lewat cron job harian (jam 00:00 atau H-1), lalu disimpan ke DB. Jangan hitung real-time tiap request — precompute lebih stabil dan bisa dikoreksi manual oleh takmir (offset ±menit) tanpa ubah logic.

3. State Machine (inti logic countdown)

Ini bagian paling penting. Buat finite state machine dengan state:

IDLE (menuju waktu sholat berikutnya)
   → ADZAN (waktu sholat masuk, tampilkan "Waktu Sholat")
   → IQOMAH_COUNTDOWN (hitung mundur X menit sesuai config per waktu)
   → SHOLAT (tampilkan "Sholat Sedang Berlangsung" / blank sampai estimasi selesai, optional)
   → IDLE (balik hitung ke waktu sholat berikutnya)

Contoh logic penentuan state (dijalankan server, dikirim ke client via socket):

js
function getCurrentState(now, todaySchedule, iqomahConfig) {
  const prayers = ['subuh','dzuhur','ashar','maghrib','isya'];
  for (const p of prayers) {
    const adzanTime = todaySchedule.times[p]; // Date object
    const iqomahEnd = addSeconds(adzanTime, iqomahConfig.iqomahDelay[p]);

    if (now >= adzanTime && now < iqomahEnd) {
      return {
        state: 'IQOMAH_COUNTDOWN',
        prayer: p,
        remaining: differenceInSeconds(iqomahEnd, now)
      };
    }
  }
  // cari next prayer terdekat untuk state IDLE
  const next = findNextPrayer(now, todaySchedule);
  return { state: 'IDLE', nextPrayer: next.name, remaining: differenceInSeconds(next.time, now) };
}

Fungsi ini dipanggil server tiap ~1 detik atau on-demand saat client konek, hasilnya dikirim via socket.

4. Kenapa jangan andalkan setInterval doang di client

Browser tab yang jalan 24/7 rentan drift (setInterval tidak presisi, apalagi kalau tab di-throttle browser saat minimized). Best practice:

Client hitung mundur pakai Date.now() diff terhadap target timestamp absolut (bukan increment counter), jadi walau interval telat tidak akumulasi error:
js
function tick() {
  const remaining = Math.max(0, Math.round((targetTimestamp - Date.now())/1000));
  render(remaining);
  requestAnimationFrame contoh setTimeout(tick, 250); // refresh lebih rapat dari 1000ms utk kompensasi drift
}
Sinkron ulang targetTimestamp ke server setiap beberapa menit (misal tiap 5 menit) via socket event, plus wajib re-sync begitu reconnect setelah putus koneksi.
Simpan jam referensi server (serverTime - clientTime = offset) sekali di awal, lalu semua perhitungan pakai Date.now() + offset, supaya jam device yang salah setting pun tidak masalah.
5. Supaya "tidak pernah mati"

Ini bukan cuma soal kode JS, tapi juga infrastruktur:

Backend: jalankan dengan pm2 (auto-restart kalau crash) atau containerize + restart: always di Docker/systemd.
Frontend (layar masjid): jalankan di browser kiosk mode (Chrome --kiosk) di mini PC/Raspberry Pi, dan pasang watchdog script yang auto-refresh/restart browser kalau tab freeze/crash (misal via xdotool/cron cek proses, atau extension kiosk seperti Fully Kiosk Browser di Android TV box — banyak masjid pakai ini).
Auto-reconnect socket: pastikan Socket.io client pakai reconnection: true dan saat reconnect langsung minta ulang state terbaru — jangan percaya state lama yang mungkin sudah stale saat disconnect lama.
Offline fallback: simpan jadwal hari ini di localStorage/IndexedDB di client. Kalau koneksi ke server putus total, client tetap bisa hitung mundur sendiri dari jadwal terakhir yang tersimpan (karena jadwal sholat tidak berubah tiap detik, cukup aman untuk fallback beberapa jam/hari).
Auto power recovery: kalau pakai mini PC, set BIOS "Restore on AC power loss" jadi ON supaya nyala otomatis begitu listrik balik setelah mati lampu, dan set autologin + autorun aplikasi di startup OS.