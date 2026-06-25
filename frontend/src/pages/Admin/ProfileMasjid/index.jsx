import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileMasjidService } from '../../../services/baseCrudService';
import { Button } from '../../../components/common/Button';
import { Edit2, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Table } from '../../../components/common/Table';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';

export function ProfileMasjidPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: profileMasjidData = [], isLoading } = useQuery({
    queryKey: ['profileMasjid'],
    queryFn: async () => {
      const data = await profileMasjidService.getAll();
      return data.map(item => ({ ...item, id: item._id || item.id }));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const id = formData.get('id');
      // Kirim formData asli agar file ikut terkirim sebagai multipart/form-data
      if (id) {
        return await profileMasjidService.update(id, formData);
      } else {
        // Hapus 'id' yang kosong agar tidak terkirim saat create
        if (!id) formData.delete('id');
        return await profileMasjidService.create(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileMasjid'] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      alert(error.message || 'Terjadi kesalahan ketika menyimpan data')
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => profileMasjidService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileMasjid'] });
    },
    onError: (error) => {
      alert(error.message || 'Gagal menghapus data!');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => profileMasjidService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileMasjid'] });
    },
    onError: (error) => {
      alert(error.message || 'Gagal mengubah status aktif!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMutation.mutate(formData);
  }

  const handleDelete = (id) => {
    if(confirm('Yakin ingin menghapus profile ini?')) {
      deleteMutation.mutate(id);
    }
  }

  const columns = [
    {key: 'nama_masjid', label: 'Nama Masjid'},
    {key: 'provinsi', label: 'Provinsi'},
    {key: 'kota', label: 'Kota'},
    {
      key: 'logo_url', 
      label: 'Logo Masjid',
      render: (row) => row.logo_url ? (
        <img src={row.logo_url} alt="Logo" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
      ) : (
        <span className="text-slate-400 italic">Belum ada logo</span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <button 
          type="button"
          onClick={() => toggleMutation.mutate(row.id)}
          disabled={toggleMutation.isPending || row.is_active}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            row.is_active 
              ? 'bg-green-100 text-green-700 cursor-default' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title={row.is_active ? "Profile Aktif" : "Klik untuk jadikan Profile Aktif"}
        >
          {row.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
          {row.is_active ? 'Aktif' : 'Nonaktif'}
        </button>
      )
    },
  ]

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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Profile Masjid</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola informasi profile masjid</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Tambah Profile Masjid
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Memuat data...</div>
      ) : (
        <Table 
          columns={columns}
          data={profileMasjidData}
          renderActions={renderActions}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Profile Masjid' : 'Tambah Profile Masjid'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingItem?.id || ''} />
          
          <Input 
            id="nama_masjid" 
            name="nama_masjid" 
            label="Nama Masjid" 
            defaultValue={editingItem?.nama_masjid || ''} 
            required 
          />
          
          <Input 
            id="provinsi" 
            name="provinsi" 
            label="Provinsi" 
            defaultValue={editingItem?.provinsi || ''} 
            required 
          />

          <Input 
            id="kota" 
            name="kota" 
            label="Kota" 
            defaultValue={editingItem?.kota || ''} 
            required 
          />

          <Input 
            id="running_text" 
            name="running_text" 
            label="Running Text (Opsional)" 
            defaultValue={editingItem?.running_text || ''} 
            placeholder="Teks berjalan untuk ditampilkan di halaman depan"
          />

          <div className="space-y-2">
            <Input 
              type="file"
              id="logo_url" 
              name="logo_url" 
              label="Logo Masjid (Opsional)" 
              accept="image/*"
            />
            {editingItem?.logo_url && (
              <p className="text-xs text-slate-500">
                Biarkan kosong jika tidak ingin mengubah logo saat ini.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">Waktu Jeda Iqomah (Menit)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Input 
                type="number"
                id="waktu_iqomah_subuh" 
                name="waktu_iqomah_subuh" 
                label="Subuh" 
                min="0"
                defaultValue={editingItem?.waktu_iqomah?.subuh ?? 15} 
                required 
              />
              <Input 
                type="number"
                id="waktu_iqomah_dzuhur" 
                name="waktu_iqomah_dzuhur" 
                label="Dzuhur" 
                min="0"
                defaultValue={editingItem?.waktu_iqomah?.dzuhur ?? 10} 
                required 
              />
              <Input 
                type="number"
                id="waktu_iqomah_ashar" 
                name="waktu_iqomah_ashar" 
                label="Ashar" 
                min="0"
                defaultValue={editingItem?.waktu_iqomah?.ashar ?? 10} 
                required 
              />
              <Input 
                type="number"
                id="waktu_iqomah_maghrib" 
                name="waktu_iqomah_maghrib" 
                label="Maghrib" 
                min="0"
                defaultValue={editingItem?.waktu_iqomah?.maghrib ?? 7} 
                required 
              />
              <Input 
                type="number"
                id="waktu_iqomah_isya" 
                name="waktu_iqomah_isya" 
                label="Isya" 
                min="0"
                defaultValue={editingItem?.waktu_iqomah?.isya ?? 10} 
                required 
              />
            </div>
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
  )
}