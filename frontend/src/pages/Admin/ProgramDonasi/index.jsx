import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { programDonasiService } from '../../../services/baseCrudService';
import { Button } from '../../../components/common/Button';
import { Edit2, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Table } from '../../../components/common/Table';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

export function ProgramDonasiPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: donasiData = [], isLoading } = useQuery({
    queryKey: ['programDonasi'],
    queryFn: async () => {
      const data = await programDonasiService.getAll();
      return data.map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return await programDonasiService.update(data.id, data);
      } else {
        return await programDonasiService.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programDonasi'] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      alert(error.message || 'Terjadi kesalahan ketika menyimpan data');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => programDonasiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programDonasi'] });
    },
    onError: (error) => {
      alert(error.message || 'Gagal menghapus data!');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => programDonasiService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programDonasi'] });
    },
    onError: (error) => {
      alert(error.message || 'Gagal mengubah status aktif!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    saveMutation.mutate({
      id: data.id || undefined,
      nama_program: data.nama_program,
      target_dana: Number(data.target_dana),
      dana_terkumpul: Number(data.dana_terkumpul)
    });
  }

  const handleDelete = (id) => {
    if(confirm('Yakin ingin menghapus program donasi ini?')) {
      deleteMutation.mutate(id);
    }
  }

  const columns = [
    {key: 'nama_program', label: 'Nama Program'},
    {
      key: 'target_dana', 
      label: 'Target Dana',
      render: (row) => formatRupiah(row.target_dana)
    },
    {
      key: 'dana_terkumpul', 
      label: 'Terkumpul',
      render: (row) => formatRupiah(row.dana_terkumpul)
    },

    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <button 
          type="button"
          onClick={() => toggleMutation.mutate(row.id)}
          disabled={toggleMutation.isPending}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            row.is_active 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title={row.is_active ? "Klik untuk menonaktifkan program" : "Klik untuk jadikan Program Aktif"}
        >
          {row.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
          {row.is_active ? 'Aktif' : 'Nonaktif'}
        </button>
      )
    },
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Program Donasi</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola target dan progress donasi</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Tambah Program
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Memuat data...</div>
      ) : (
        <Table 
          columns={columns}
          data={donasiData}
          renderActions={renderActions}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Program Donasi' : 'Tambah Program Donasi'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingItem?.id || ''} />
          
          <Input 
            id="nama_program" 
            name="nama_program" 
            label="Nama Program" 
            defaultValue={editingItem?.nama_program || ''} 
            required 
          />
          
          <Input 
            type="number"
            id="target_dana" 
            name="target_dana" 
            label="Target Dana (Rp)" 
            min="0"
            defaultValue={editingItem?.target_dana || ''} 
            required 
          />

          <Input 
            type="number"
            id="dana_terkumpul" 
            name="dana_terkumpul" 
            label="Dana Terkumpul (Rp)" 
            min="0"
            defaultValue={editingItem?.dana_terkumpul || 0} 
            required 
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
  )
}
