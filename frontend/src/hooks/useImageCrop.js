import { useState } from 'react';
import { getCroppedImg } from '../utils/cropImage';

export function useImageCrop(inputId, defaultFileName = 'cropped.png') {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageFile, setCroppedImageFile] = useState(null);
  const [croppedImagePreview, setCroppedImagePreview] = useState(null);

  const clearFileInput = () => {
    const el = document.getElementById(inputId);
    if (el) el.value = '';
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], defaultFileName, { type: 'image/png' });
      setCroppedImageFile(file);
      setCroppedImagePreview(URL.createObjectURL(croppedBlob));
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      alert('Gagal memotong gambar');
    }
  };

  const handleCancelCrop = () => {
    setImageSrc(null);
    clearFileInput();
  };

  const handleRemoveCroppedImage = () => {
    setCroppedImageFile(null);
    setCroppedImagePreview(null);
    clearFileInput();
  };

  return {
    imageSrc,
    setImageSrc,
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    setCroppedAreaPixels,
    croppedImageFile,
    setCroppedImageFile,
    croppedImagePreview,
    setCroppedImagePreview,
    onCropComplete,
    onFileChange,
    handleCropSave,
    handleCancelCrop,
    handleRemoveCroppedImage,
    clearFileInput,
  };
}
