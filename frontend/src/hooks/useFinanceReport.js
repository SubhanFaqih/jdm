import { useQuery } from '@tanstack/react-query';
import { kasService, programDonasiService } from '../services/baseCrudService';

export function useFinanceReport() {
  // Fetch cash transaction logs
  const { data: kasLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['kasLogs'],
    queryFn: async () => await kasService.getAll(),
    refetchOnWindowFocus: false,
  });

  // Fetch stats (current balance, etc.)
  const { data: stats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['kasStats'],
    queryFn: async () => await kasService.getStats(),
    refetchOnWindowFocus: false,
  });

  // Fetch donation programs
  const { data: donasiPrograms = [], isLoading: isLoadingDonasi } = useQuery({
    queryKey: ['programDonasi'],
    queryFn: async () => await programDonasiService.getAll(),
    refetchOnWindowFocus: false,
  });

  const isLoading = isLoadingLogs || isLoadingStats || isLoadingDonasi;

  // 1. Calculate totalSaldo from stats (stats is stored in cents)
  const totalSaldo = (stats.saldo_sekarang || 0) / 100;

  // 2. Filter logs to select only non-hidden items
  const activeLogs = kasLogs.filter(log => !log.isHidden);

  // 3. Separate into pemasukan and pengeluaran
  const pemasukanLogs = activeLogs.filter(log => log.tipe === 'pemasukan');
  const pengeluaranLogs = activeLogs.filter(log => log.tipe === 'pengeluaran');

  // 4. Sort and slice to top 5
  const topPemasukan = pemasukanLogs.slice(0, 5).map(item => ({
    label: item.keterangan,
    amount: (item.nominal || 0) / 100
  }));

  const topPengeluaran = pengeluaranLogs.slice(0, 5).map(item => ({
    label: item.keterangan,
    amount: (item.nominal || 0) / 100
  }));

  // 5. Progress Donasi Pembangunan
  const activeDonasi = donasiPrograms.find(p => p.is_active);
  const targetDonasi = activeDonasi ? activeDonasi.target_dana : 0;
  const terkumpulDonasi = activeDonasi ? activeDonasi.dana_terkumpul : 0;
  const namaProgram = activeDonasi ? activeDonasi.nama_program : "Donasi Pembangunan";

  const pemasukanBulanIni = (stats.pemasukan_bulan_ini || 0) / 100;
  const pengeluaranBulanIni = (stats.pengeluaran_bulan_ini || 0) / 100;

  return {
    totalSaldo,
    pemasukan: topPemasukan,
    pengeluaran: topPengeluaran,
    targetDonasi,
    terkumpulDonasi,
    namaProgram,
    pemasukanBulanIni,
    pengeluaranBulanIni,
    hasActiveDonasi: !!activeDonasi,
    isLoading
  };
}
