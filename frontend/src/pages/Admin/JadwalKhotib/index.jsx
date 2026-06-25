import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { jadwalKhotibService, ustadzService } from '../../../services/baseCrudService';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Table } from '../../../components/common/Table';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export function JadwalKhotibPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch Jadwal Khotib
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['jadwalKhotib'],
    queryFn: async () => {
      const data = await jadwalKhotibService.getAll();
      return data.map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  // Fetch Ustadz for Dropdown
  const { data: ustadzList = [], isLoading: isLoadingUstadz } = useQuery({
    queryKey: ['ustadz'],
    queryFn: async () => {
      const data = await ustadzService.getAll();
      return data.filter(u => u.is_active).map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const id = formData.get('id');
      const payload = {
        tanggal: formData.get('tanggal'),
        ustadz_id: formData.get('ustadz_id'),
        tema: formData.get('tema')
      };

      if (id) {
        return await jadwalKhotibService.update(id, payload);
      } else {
        return await jadwalKhotibService.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwalKhotib'] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      alert(error.message || 'Terjadi kesalahan ketika menyimpan data');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jadwalKhotibService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwalKhotib'] });
    },
    onError: (error) => {
      alert(error.message || 'Gagal menghapus data!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const columns = [
    { 
      key: 'tanggal', 
      label: 'Tanggal',
      render: (row) => formatDate(row.tanggal)
    },
    { 
      key: 'ustadz_id', 
      label: 'Khotib / Ustadz',
      render: (row) => row.ustadz_id?.nama || <span className="text-slate-400 italic">Tidak diketahui</span>
    },
    { 
      key: 'tema', 
      label: 'Tema',
      render: (row) => row.tema || <span className="text-slate-400 italic">Tidak ada tema</span>
    }
  ];

  const renderActions = (row) => (
    <div className="flex justify-end gap-2">
      <Button 
        variant="ghost" 
        className="px-2"
        onClick={() => {
          setEditingItem(row);
          setIsModalOpen(true);
        }}
      >
        <Edit2 className="w-4 h-4 text-blue-500" />
      </Button>
      <Button 
        variant="ghost" 
        className="px-2"
        onClick={() => handleDelete(row.id)}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Jadwal Khotib</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola jadwal khotib sholat Jumat</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Tambah Jadwal
        </Button>
      </div>

      {isLoadingSchedules ? (
        <div className="text-center py-10 text-slate-500">Memuat data...</div>
      ) : (
        <Table 
          columns={columns}
          data={schedules}
          renderActions={renderActions}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Jadwal Khotib' : 'Tambah Jadwal Khotib'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingItem?.id || ''} />
          
          <Input 
            type="date"
            id="tanggal" 
            name="tanggal" 
            label="Tanggal" 
            defaultValue={editingItem?.tanggal ? editingItem.tanggal.split('T')[0] : ''} 
            required 
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="ustadz_id" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Pilih Ustadz / Khotib
            </label>
            <select
              id="ustadz_id"
              name="ustadz_id"
              required
              defaultValue={editingItem?.ustadz_id?._id || editingItem?.ustadz_id || ''}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="" disabled>-- Pilih Ustadz --</option>
              {isLoadingUstadz ? (
                <option disabled>Memuat daftar ustadz...</option>
              ) : (
                ustadzList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))
              )}
            </select>
          </div>

          <Input 
            id="tema" 
            name="tema" 
            label="Tema / Topik (Opsional)" 
            defaultValue={editingItem?.tema || ''} 
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saveMutation.isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
