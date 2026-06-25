export const ASSETS = {
  background: 'https://www.transparenttextures.com/patterns/arabesque.png', // Subtle islamic pattern
  logo: 'https://placehold.co/200x60/ffffff/004d99?text=MASLAM', // Placeholder powered by logo
  ustadz: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  pengurus1: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
  pengurus2: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
  pengurus3: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
};

export const MASJID_INFO = {
  name: 'Masjid Al-Muhajirin',
  address: 'Cluster Jasmine - Grand Depok City\nKota Depok - Jawa Barat',
};

export const JADWAL_KHOTIB = [
  { date: '16 Juni', name: 'Ustadz Ahmad Zacky Mirza' },
  { date: '23 Juni', name: 'Ustadz Ahmad Zacky Mirza' },
  { date: '30 Juni', name: 'Ustadz Ahmad Zacky Mirza' },
  { date: '7 Juli', name: 'Ustadz Ahmad Zacky Mirza' },
];

export const KEUANGAN_BARU = {
  totalSaldo: 172803334,
  pemasukan: [
    { label: 'Infaq Projek', amount: 114408032 },
    { label: 'Wakaf', amount: 14000000 },
    { label: 'Pinjaman Masjid', amount: 43650000 },
    { label: 'Pendapatan Lainnya', amount: 6565550 },
    { label: 'Infaq Operasional', amount: 2000050 },
  ],
  pengeluaran: [
    { label: 'Gaji dan Insentif Prog...', amount: 4000000 },
    { label: 'Biaya Lainnya', amount: 1000000 },
    { label: 'Tagihan Internet', amount: 525250 },
    { label: 'BPJS Kesehatan', amount: 396584 },
    { label: 'BPJS Ketenagakerjaan', amount: 809201 },
  ],
  targetDonasi: 150000000,
  terkumpulDonasi: 95500000,
};

export const PENGURUS = [
  { nama: 'Girindro Pringgo Digdo', jabatan: 'Pengawas', foto: ASSETS.pengurus1 },
  { nama: 'Syssetiadi', jabatan: 'Ketua Yayasan', foto: ASSETS.pengurus2 },
  { nama: 'Niken Dwi Astuti', jabatan: 'Sekretaris', foto: ASSETS.pengurus3 },
];

export const RUNNING_TEXT = [
  "Masjid Maslam Visioner",
  "Transformasi Masjid, Kebangkitan Peradaban, Bersama Maslam",
  "To Be Masjid Visioner",
  "24 hari menuju Isra Mi'raj - 16 Januari 2026",
  "87 hari menuju Ramadhan"
];

export const HADIST = {
  teks: '"Barangsiapa membangun masjid karena Allah, maka Allah akan membangunkan baginya rumah di surga."',
  sumber: '(HR. Bukhari dan Muslim)'
};
