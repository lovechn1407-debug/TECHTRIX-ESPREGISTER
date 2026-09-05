import { useState, useCallback } from 'react';
import { uploadImageToImgBB } from '../lib/imgbb';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileSelect = useCallback((file) => {
    if (!file) {
      setPreview(null);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const upload = useCallback(async (file) => {
    if (!file) return null;
    setUploading(true);
    setError(null);

    try {
      const url = await uploadImageToImgBB(file);
      setUploadedUrl(url);
      setUploading(false);
      return url;
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      setUploading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setError(null);
    setPreview(null);
    setUploadedUrl(null);
  }, []);

  return {
    uploading,
    error,
    preview,
    uploadedUrl,
    handleFileSelect,
    upload,
    reset,
    setUploadedUrl,
    setPreview,
  };
}
