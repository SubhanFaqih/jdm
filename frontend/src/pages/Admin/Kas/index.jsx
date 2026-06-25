import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '../../../components/common/Table';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { kasService, programDonasiService } from '../../../services/baseCrudService';

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function KasPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [transactionType, setTransactionType] = useState('pemasukan');
  const [isOpenDonasi, setIsOpenDonasi] = useState(false);

  // Fetch Data Logs
  const { data: kasLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['kasLogs'],
    queryFn: async () => {
      const data = await kasService.getAll();
      return data.map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  // Fetch Stats
  const { data: stats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['kasStats'],
    queryFn: async () => {
      return await kasService.getStats();
    }
  });

  // Fetch active donation programs
  const { data: donasiPrograms = [] } = useQuery({
    queryKey: ['activeProgramDonasi'],
    queryFn: async () => {
      const data = await programDonasiService.getAll();
      return data.filter(p => p.is_active).map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  // Create & Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const data = Object.fromEntries(formData.entries());
      data.nominal = Number(data.nominal);
      
      if (editingData) {
        return await kasService.update(editingData.id, data);
      }
      return await kasService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasLogs'] });
      queryClient.invalidateQueries({ queryKey: ['kasStats'] });
      closeModal();
    },
    onError: (error) => {
      alert(error.message || 'Terjadi kesalahan saat menyimpan data');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await kasService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasLogs'] });
      queryClient.invalidateQueries({ queryKey: ['kasStats'] });
    },
    onError: (error) => {
      alert(error.message || 'Terjadi kesalahan saat menghapus data');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Clear program_donasi_id if not a donation
    if (!isOpenDonasi || transactionType !== 'pemasukan') {
      formData.set('program_donasi_id', '');
    }

    saveMutation.mutate(formData);
  };

  const handleEdit = (row) => {
    setEditingData(row);
    setTransactionType(row.tipe);
    setIsOpenDonasi(!!row.program_donasi_id);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingData(null);
    setTransactionType('pemasukan');
    setIsOpenDonasi(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const columns = [
    { 
      key: 'kasId', 
      label: 'ID',
      render: (row) => row.kasId ? `TRX-${row.kasId}` : '-'
    },
    { 
      key: 'tanggal', 
      label: 'Tanggal',
      render: (row) => formatDate(row.tanggal)
    },
    { key: 'keterangan', label: 'Keterangan' },
    { 
      key: 'tipe', 
      label: 'Tipe',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.tipe === 'pemasukan' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {row.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      )
    },
    { 
      key: 'nominal', 
      label: 'Jumlah',
      render: (row) => formatRupiah((row.nominal || 0) / 100)
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
            <Pencil className="w-4 h-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} disabled={deleteMutation.isPending}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Laporan Kas</h2>
          <p className="text-slate-500 dark:text-slate-400">Pencatatan arus kas masjid</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Tambah Transaksi
        </Button>
      </div>

      {!isLoadingStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo Sekarang</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{formatRupiah((stats.saldo_sekarang || 0) / 100)}</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pemasukan Bulan Ini</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{formatRupiah((stats.pemasukan_bulan_ini || 0) / 100)}</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pengeluaran Bulan Ini</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{formatRupiah((stats.pengeluaran_bulan_ini || 0) / 100)}</p>
          </div>
        </div>
      )}

      {isLoadingLogs ? (
        <div className="text-center py-10 text-slate-500">Memuat data...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <Table 
            columns={columns}
            data={kasLogs}
          />
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={editingData ? "Edit Transaksi Kas" : "Tambah Transaksi Kas"}
      >
        <form key={editingData?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="tipe" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tipe Transaksi
            </label>
            <select
              id="tipe"
              name="tipe"
              required
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-900 dark:text-slate-100"
            >
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>

          {transactionType === 'pemasukan' && (
            <div className="flex flex-col gap-2 p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/20">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isOpenDonasi}
                  onChange={(e) => setIsOpenDonasi(e.target.checked)}
                  className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Apakah ini uang donasi?
                </span>
              </label>

              {isOpenDonasi && (
                <select
                  name="program_donasi_id"
                  required={isOpenDonasi}
                  defaultValue={editingData?.program_donasi_id || ""}
                  className="px-3 py-2 mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-900 dark:text-slate-100"
                >
                  <option value="" disabled>Pilih Program Donasi Aktif</option>
                  {donasiPrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.nama_program}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <Input 
            type="number"
            id="nominal" 
            name="nominal" 
            label="Nominal (Rp)" 
            placeholder="Contoh: 500000"
            defaultValue={editingData ? editingData.nominal / 100 : ''}
            required 
            min="1"
          />

          <Input 
            id="keterangan" 
            name="keterangan" 
            label="Keterangan" 
            placeholder="Contoh: Kotak Amal Jumat"
            defaultValue={editingData?.keterangan || ''}
            required 
          />

          <Input 
            type="date"
            id="tanggal" 
            name="tanggal" 
            label="Tanggal" 
            defaultValue={editingData ? new Date(editingData.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            required 
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={saveMutation.isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
