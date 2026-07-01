import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { profileMasjidService } from '../../../services/baseCrudService';
import { Button } from '../../../components/common/Button';
import { Plus } from 'lucide-react';
import { useImageCrop } from '../../../hooks/useImageCrop';
import { ProfileMasjidTable } from './_component/ProfileMasjidTable';
import { ProfileMasjidModal } from './_component/ProfileMasjidModal';

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
    let clean = name.replace(/Kabupaten\s+/i, 'Kab. ');
    clean = clean.replace(/Administrasi\s+/i, '');
    return clean.trim();
  };

  // 1. Fetch Provinsi langsung saat user masuk ke halaman Profile Masjid (Mount) dengan Cache SessionStorage
  useEffect(() => {
    const fetchProvinces = async () => {
      const cachedProvinces = sessionStorage.getItem('provinces_cache');

      if (cachedProvinces) {
        setProvinces(JSON.parse(cachedProvinces));
        return;
      }

      setIsLoadingProvinces(true);
      try {
        const response = await fetch('/api/wilayah/provinces');
        if (response.ok) {
          const result = await response.json();
          if (result && result.data) {
            setProvinces(result.data);
            sessionStorage.setItem('provinces_cache', JSON.stringify(result.data));
          }
        }
      } catch (err) {
        console.error('Error fetching provinces:', err);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []); // Array kosong [] memastikan fetch langsung berjalan saat halaman diakses

  // 2. Sinkronkan provinsi terpilih ketika user membuka form edit
  useEffect(() => {
    if (isModalOpen && editingItem?.provinsi && provinces.length > 0) {
      const matchedProv = provinces.find(
        (p) => p.name.toLowerCase() === editingItem.provinsi.toLowerCase()
      );
      if (matchedProv) {
        setSelectedProvinceCode(matchedProv.code);
        setSelectedProvinceName(matchedProv.name);
      }
    }
  }, [isModalOpen, editingItem, provinces]);

  // Fetch Cities when selectedProvinceCode changes (Langsung dari backend, tidak disimpan di sessionStorage)
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
    // setProvinces([]);
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
    if (confirm('Yakin ingin menghapus profile ini?')) {
      deleteMutation.mutate(id);
    }
  }

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
        <ProfileMasjidTable
          data={profileMasjidData}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
          onToggleActive={(id) => toggleMutation.mutate(id)}
          isTogglePending={toggleMutation.isPending}
          isDeletePending={deleteMutation.isPending}
        />
      )}

      <ProfileMasjidModal
        isOpen={isModalOpen}
        onClose={handleCloseForm}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isPending={saveMutation.isPending}
        provinces={provinces}
        cities={cities}
        selectedProvinceCode={selectedProvinceCode}
        selectedProvinceName={selectedProvinceName}
        selectedCityName={selectedCityName}
        isLoadingProvinces={isLoadingProvinces}
        isLoadingCities={isLoadingCities}
        handleProvinceChange={handleProvinceChange}
        setSelectedCityName={setSelectedCityName}
        imageSrc={imageSrc}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        croppedImagePreview={croppedImagePreview}
        onFileChange={onFileChange}
        handleRemoveCroppedImage={handleRemoveCroppedImage}
        handleCancelCrop={handleCancelCrop}
        handleCropSave={handleCropSave}
        onCropComplete={onCropComplete}
      />
    </div>
  )
}