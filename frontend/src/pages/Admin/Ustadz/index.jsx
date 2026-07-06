import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '../../../components/common/Table';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Toggle } from '../../../components/common/Toggle';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ustadzService } from '../../../services/baseCrudService';
import Cropper from 'react-easy-crop';
import { useImageCrop } from '../../../hooks/useImageCrop';

export function UstadzPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const {
    imageSrc,
    crop,
    setCrop,
    zoom,
    setZoom,
    setCroppedImageFile,
    setCroppedImagePreview,
    croppedImageFile,
    croppedImagePreview,
    onCropComplete,
    onFileChange,
    handleCropSave,
    handleCancelCrop,
    handleRemoveCroppedImage,
  } = useImageCrop('foto_url', 'ustadz_foto.png');

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
      handleCloseForm();
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

  const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false);

  const handleOpenForm = (item) => {
    setEditingItem(item);
    setCroppedImageFile(null);
    setCroppedImagePreview(null);
    setShouldDeletePhoto(false);
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setCroppedImageFile(null);
    setCroppedImagePreview(null);
    setShouldDeletePhoto(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (croppedImageFile) {
      formData.set('foto_url', croppedImageFile, 'ustadz_foto.png');
    } else if (shouldDeletePhoto) {
      formData.set('foto_url', '');
    } else {
      formData.delete('foto_url');
    }
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
        onClick={() => handleOpenForm(row)}
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
        <Button onClick={() => handleOpenForm(null)}>
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
        onClose={handleCloseForm}
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
              onChange={onFileChange}
            />
            {croppedImagePreview ? (
              <div className="flex items-center gap-4 mt-2">
                <img 
                  src={croppedImagePreview} 
                  alt="Cropped Preview" 
                  className="w-16 h-16 object-cover rounded-full border border-slate-200" 
                />
                <button
                  type="button"
                  onClick={handleRemoveCroppedImage}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Hapus / Ganti
                </button>
              </div>
            ) : (editingItem?.foto_url && !shouldDeletePhoto) ? (
              <div className="flex items-center gap-4 mt-2">
                <img 
                  src={editingItem.foto_url} 
                  alt="Foto Saat Ini" 
                  className="w-16 h-16 object-cover rounded-full border border-slate-200" 
                />
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-xs text-slate-500">
                    Foto saat ini. Unggah file baru untuk menggantinya.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShouldDeletePhoto(true)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Hapus Foto Sekarang
                  </button>
                </div>
              </div>
            ) : shouldDeletePhoto ? (
              <div className="flex items-center justify-between mt-2 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Foto saat ini akan dihapus setelah disimpan.
                </p>
                <button
                  type="button"
                  onClick={() => setShouldDeletePhoto(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium underline cursor-pointer"
                >
                  Batal Hapus
                </button>
              </div>
            ) : null}
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
            <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={saveMutation.isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Crop Foto */}
      {imageSrc && (
        <Modal 
          isOpen={!!imageSrc} 
          onClose={handleCancelCrop}
          title="Potong Foto Ustadz"
        >
          <div className="space-y-4">
            <div className="relative w-full h-80 bg-slate-900 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500">Zoom</span>
              <input 
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleCancelCrop}>
                Batal
              </Button>
              <Button type="button" onClick={handleCropSave}>
                Potong & Simpan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
