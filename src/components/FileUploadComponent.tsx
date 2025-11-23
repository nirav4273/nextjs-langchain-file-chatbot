'use client';

import { useRef, useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

interface ProcessingState {
  loading: boolean;
  error: string | null;
  success: boolean;
  documentInfo: Record<string, unknown> | null;
}

interface FileUploadComponentProps {
  onFileProcessed?: (filename: string) => void;
}

export const FileUploadComponent = ({ onFileProcessed }: FileUploadComponentProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, error, success, uploadedFile, reset } = useFileUpload();
  const [processing, setProcessing] = useState<ProcessingState>({
    loading: false,
    error: null,
    success: false,
    documentInfo: null,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    await uploadFile(selectedFiles[0]);
    setSelectedFiles([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessDocument = async () => {
    if (!uploadedFile) return;

    try {
      setProcessing((prev: ProcessingState) => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: uploadedFile.filename,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setProcessing((prev: ProcessingState) => ({
          ...prev,
          loading: false,
          error: data.error || 'Failed to process document',
        }));
        return;
      }

      setProcessing({
        loading: false,
        error: null,
        success: true,
        documentInfo: data.document,
      });

      // Call the callback with filename
      if (onFileProcessed) {
        onFileProcessed(uploadedFile.filename);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setProcessing((prev: ProcessingState) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFiles([]);
    setProcessing({
      loading: false,
      error: null,
      success: false,
      documentInfo: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={uploading || processing.loading}
        className="hidden"
        accept=".pdf"
      />

      {/* Choose File Button */}
      <button
        onClick={handleChooseFile}
        disabled={uploading || processing.loading}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded transition-colors duration-200 text-sm"
      >
        Choose PDF File
      </button>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded border border-blue-300 dark:border-blue-700">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">Selected Files:</p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-100 dark:bg-blue-900 p-2 rounded text-xs">
                <span className="text-blue-900 dark:text-blue-100 truncate flex-1">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="ml-2 text-blue-600 hover:text-red-600 dark:text-blue-400 dark:hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !success && !processing.success && (
        <button
          onClick={handleUpload}
          disabled={uploading || processing.loading}
          className="w-full mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded transition-colors duration-200 text-sm"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      )}

      {/* Upload Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <p className="font-semibold text-xs mb-1">Upload Error</p>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Process Document Button */}
      {success && uploadedFile && !processing.success && (
        <button
          onClick={handleProcessDocument}
          disabled={processing.loading}
          className="w-full mt-3 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold rounded transition-colors duration-200 text-sm flex items-center justify-center gap-2"
        >
          {processing.loading ? (
            <>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200" />
              </div>
              <span>Processing Document...</span>
            </>
          ) : (
            'Process & Ready for Questions'
          )}
        </button>
      )}

      {/* Processing Error */}
      {processing.error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <p className="font-semibold text-xs mb-1">Processing Error</p>
          <p className="text-xs">{processing.error}</p>
        </div>
      )}

      {/* Processing Success */}
      {processing.success && processing.documentInfo && (
        <div className="mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          <p className="font-semibold text-xs mb-2">✓ Document Ready!</p>
          <div className="text-xs space-y-1 mb-2">
            <p><strong>File:</strong> {String(processing.documentInfo.filename)}</p>
            <p><strong>Pages:</strong> {String(processing.documentInfo.pageCount)}</p>
            <p><strong>Chunks:</strong> {String(processing.documentInfo.totalChunks)}</p>
            <p><strong>Content Length:</strong> {((processing.documentInfo.contentLength as number) / 1024).toFixed(2)} KB</p>
          </div>
          <p className="text-xs text-green-600">Ready to answer questions about this document!</p>
          <button
            onClick={handleReset}
            className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
          >
            Upload New Document
          </button>
        </div>
      )}
    </div>
  );
};