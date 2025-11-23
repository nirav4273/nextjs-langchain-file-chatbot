'use client';

import { useState } from 'react';
import { validateFile } from './fileUploadConfig';

interface UploadResponse {
  message: string;
  filename: string;
  path: string;
}

interface UploadError {
  error: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);

  const uploadFile = async (file: File) => {
    // Reset states
    setError(null);
    setSuccess(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse | UploadError = await response.json();

      if (!response.ok) {
        const errorData = data as UploadError;
        setError(errorData.error || 'Upload failed');
        return;
      }

      const successData = data as UploadResponse;
      setUploadedFile(successData);
      setSuccess(successData.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(null);
    setUploadedFile(null);
  };

  return {
    uploadFile,
    uploading,
    error,
    success,
    uploadedFile,
    reset,
  };
};