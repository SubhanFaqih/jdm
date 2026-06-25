import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '../../../components/common/Table';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Toggle } from '../../../components/common/Toggle';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ustadzService } from '../../../services/baseCrudService';

export function UstadzPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch Data using React Query
  const { data: ustadzData = [], isLoading } = useQuery({
    queryKey: ['ustadz'],
    queryFn: async () => {
      const data = await ustadzService.getAll();
      return data.map(item => ({ ...item, id: item._id || item.id}));
    }
  });

  // Mutations for Create/Update
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const id = formData.get('id');
      
      // Checkbox is_active akan ada jika dicentang, dan tidak ada jika tidak dicentang.
      // Kita set manual menjadi string 'true' / 'false' agar aman diproses backend.
      formData.set('is_active', formData.has('is_active') ? 'true' : 'false');

      // Kirim formData asli agar file ikut terkirim sebagai multipart/form-data
      if (id) {
        return await ustadzService.update(id, formData);
      } else {
        // Hapus 'id' yang kosong agar tidak terkirim saat create
        if (!id) formData.delete('id');
        return await ustadzService.create(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ustadz'] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      alert(error.message || 'Terjadi kesalahan saat menyimpan data');
    }
  });

  // Mutation for Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => ustadzService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ustadz'] });
    },
    onError: (error) => {
      alert(error.message || 'Gagal menghapus data');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus ustadz ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'no_hp', label: 'No. HP' },
    { 
      key: 'foto_url', 
      label: 'Foto Profil',
      render: (row) => row.foto_url ? (
        <img src={row.foto_url} alt="Foto" className="w-12 h-12 object-cover rounded-full border border-slate-200" />
      ) : (
        <span className="text-slate-400 italic">Belum ada foto</span>
      )
    },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                       : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {row.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      )
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ustadz</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola data ustadz / penceramah</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Tambah Ustadz
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Memuat data...</div>
      ) : (
        <Table 
          columns={columns}
          data={ustadzData}
          renderActions={renderActions}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Ustadz' : 'Tambah Ustadz'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingItem?.id || ''} />
          
          <Input 
            id="nama" 
            name="nama" 
            label="Nama Lengkap" 
            defaultValue={editingItem?.nama || ''} 
            required 
          />
          
          <Input 
            id="no_hp" 
            name="no_hp" 
            label="No. Handphone" 
            defaultValue={editingItem?.no_hp || ''} 
          />

          <div className="space-y-2">
            <Input 
              type="file"
              id="foto_url" 
              name="foto_url" 
              label="Foto Profil (Opsional)" 
              accept="image/*"
            />
            {editingItem?.foto_url && (
              <p className="text-xs text-slate-500">
                Biarkan kosong jika tidak ingin mengubah foto profil saat ini.
              </p>
            )}
          </div>

          <div className="pt-2">
            <Toggle 
              id="is_active" 
              name="is_active" 
              label="Status Ustadz Aktif" 
              defaultChecked={editingItem ? editingItem.is_active : true} 
            />
          </div>

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
