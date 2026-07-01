import Cropper from 'react-easy-crop';
import { Modal } from '../../../../components/common/Modal';
import { Input } from '../../../../components/common/Input';
import { Button } from '../../../../components/common/Button';
import { SearchableSelect } from '../../../../components/common/SearchableSelect';

export function ProfileMasjidModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  // Province & City lists / states
  provinces,
  cities,
  selectedProvinceCode,
  selectedProvinceName,
  selectedCityName,
  isLoadingProvinces,
  isLoadingCities,
  handleProvinceChange,
  setSelectedCityName,
  // Image Crop states & handlers
  imageSrc,
  crop,
  setCrop,
  zoom,
  setZoom,
  croppedImagePreview,
  onFileChange,
  handleRemoveCroppedImage,
  handleCancelCrop,
  handleCropSave,
  onCropComplete,
}) {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingItem ? 'Edit Profile Masjid' : 'Tambah Profile Masjid'}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={editingItem?.id || ''} />

          <Input
            id="nama_masjid"
            name="nama_masjid"
            label="Nama Masjid"
            defaultValue={editingItem?.nama_masjid || ''}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <input type="hidden" name="provinsi" value={selectedProvinceName} />
            <SearchableSelect
              label="Provinsi"
              id="provinsi_select"
              required
              value={selectedProvinceCode}
              onChange={(val) => handleProvinceChange({ target: { value: val } })}
              options={provinces.map((p) => ({ value: p.code, label: p.name }))}
              placeholder={isLoadingProvinces ? 'Memuat Provinsi...' : 'Pilih Provinsi'}
              disabled={isLoadingProvinces}
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <input type="hidden" name="kota" value={selectedCityName} />
            <SearchableSelect
              label="Kota / Kabupaten"
              id="kota_select"
              required
              value={selectedCityName}
              onChange={(val) => setSelectedCityName(val)}
              options={cities.map((c) => ({ value: c.name, label: c.name }))}
              placeholder={
                !selectedProvinceCode
                  ? 'Pilih Provinsi Terlebih Dahulu'
                  : isLoadingCities
                    ? 'Memuat Kota...'
                    : 'Pilih Kota / Kabupaten'
              }
              disabled={!selectedProvinceCode || isLoadingCities}
            />
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
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
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
    </>
  );
}
