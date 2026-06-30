import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { profileMasjidService } from '../../../services/baseCrudService';
import { Button } from '../../../components/common/Button';
import { Edit2, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Table } from '../../../components/common/Table';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import Cropper from 'react-easy-crop';
import { useImageCrop } from '../../../hooks/useImageCrop';

export function ProfileMasjidPage() {
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
  } = useImageCrop('logo_url', 'logo.png');

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
      if (id) {
        return await profileMasjidService.update(id, formData);
      } else {
        if (!id) formData.delete('id');
        return await profileMasjidService.create(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileMasjid'] });
      handleCloseForm();
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

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const cleanRegencyName = (name) => {
    let clean = name.replace(/Kabupaten\s+/i, 'Kota ');
    clean = clean.replace(/Administrasi\s+/i, '');
    return clean.trim();
  };

  // Fetch Provinces on Modal Open
  useEffect(() => {
    if (!isModalOpen) return;

    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await fetch('/api/wilayah/provinces');
        if (response.ok) {
          const result = await response.json();
          if (result && result.data) {
            setProvinces(result.data);
            if (editingItem?.provinsi) {
              const matchedProv = result.data.find(
                (p) => p.name.toLowerCase() === editingItem.provinsi.toLowerCase()
              );
              if (matchedProv) {
                setSelectedProvinceCode(matchedProv.code);
                setSelectedProvinceName(matchedProv.name);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching provinces:', err);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, [isModalOpen, editingItem]);

  // Fetch Cities when selectedProvinceCode changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch(`/api/wilayah/regencies/${selectedProvinceCode}`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.data) {
            const mappedCities = result.data.map((c) => ({
              code: c.code,
              name: cleanRegencyName(c.name)
            }));
            setCities(mappedCities);
            if (editingItem?.kota) {
              const matchedCity = mappedCities.find(
                (c) => c.name.toLowerCase() === editingItem.kota.toLowerCase()
              );
              if (matchedCity) {
                setSelectedCityName(matchedCity.name);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedProvinceCode, editingItem]);

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const provObj = provinces.find(p => p.code === code);
    setSelectedProvinceName(provObj ? provObj.name : '');
    setSelectedCityName('');
    setCities([]);
  };

  const handleOpenForm = (item) => {
    setEditingItem(item);
    setCroppedImageFile(null);
    setCroppedImagePreview(null);
    setSelectedProvinceCode('');
    setSelectedProvinceName(item?.provinsi || '');
    setSelectedCityName(item?.kota || '');
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setCroppedImageFile(null);
    setCroppedImagePreview(null);
    setSelectedProvinceCode('');
    setSelectedProvinceName('');
    setSelectedCityName('');
    setProvinces([]);
    setCities([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (croppedImageFile) {
      formData.set('logo_url', croppedImageFile, 'logo.png');
    }
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Profile Masjid</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola informasi profile masjid</p>
        </div>
        <Button onClick={() => handleOpenForm(null)}>
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
        onClose={handleCloseForm}
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
          
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="provinsi" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Provinsi
            </label>
            <input type="hidden" name="provinsi" value={selectedProvinceName} />
            <select
              id="provinsi_select"
              required
              value={selectedProvinceCode}
              onChange={handleProvinceChange}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-900 dark:text-slate-100"
              disabled={isLoadingProvinces}
            >
              <option value="">{isLoadingProvinces ? 'Memuat Provinsi...' : 'Pilih Provinsi'}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="kota" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Kota / Kabupaten
            </label>
            <input type="hidden" name="kota" value={selectedCityName} />
            <select
              id="kota_select"
              required
              value={selectedCityName}
              onChange={(e) => setSelectedCityName(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-slate-900 dark:text-slate-100"
              disabled={!selectedProvinceCode || isLoadingCities}
            >
              <option value="">
                {!selectedProvinceCode 
                  ? 'Pilih Provinsi Terlebih Dahulu' 
                  : isLoadingCities 
                    ? 'Memuat Kota...' 
                    : 'Pilih Kota / Kabupaten'}
              </option>
              {cities.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

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
              onChange={onFileChange}
            />
            {croppedImagePreview ? (
              <div className="flex items-center gap-4 mt-2">
                <img 
                  src={croppedImagePreview} 
                  alt="Cropped Preview" 
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200" 
                />
                <button
                  type="button"
                  onClick={handleRemoveCroppedImage}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Hapus / Ganti
                </button>
              </div>
            ) : editingItem?.logo_url ? (
              <div className="flex items-center gap-4 mt-2">
                <img 
                  src={editingItem.logo_url} 
                  alt="Logo Saat Ini" 
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200" 
                />
                <p className="text-xs text-slate-500">
                  Logo saat ini. Unggah file baru untuk menggantinya.
                </p>
              </div>
            ) : null}
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
            <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={saveMutation.isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Crop Logo */}
      {imageSrc && (
        <Modal 
          isOpen={!!imageSrc} 
          onClose={handleCancelCrop}
          title="Potong Logo Masjid"
        >
          <div className="space-y-4">
            <div className="relative w-full h-80 bg-slate-900 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
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
  )
}