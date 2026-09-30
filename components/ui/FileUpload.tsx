'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface FileUploadProps {
  accept?: string;
  folder: string;
  onUploaded: (url: string) => void;
  currentUrl?: string;
  label?: string;
}

export function FileUpload({
  accept = 'image/*',
  folder,
  onUploaded,
  currentUrl,
  label,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        const res = await axiosInstance.post('/api/v1/storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const data = res.data;
        const url = data.data?.url ?? data.url ?? data.data;
        setPreview(url);
        onUploaded(url);
      } catch {
        // Upload failed — user can retry
      } finally {
        setUploading(false);
      }
    },
    [folder, onUploaded]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemove = () => {
    setPreview(null);
    onUploaded('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      {preview ? (
        <div className="relative w-full h-40 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden group">
          <Image
            src={preview}
            alt="Uploaded preview"
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          ) : (
            <Upload className="h-6 w-6 text-gray-400" />
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {uploading ? 'Uploading...' : 'Drag & drop or click to browse'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            PNG, JPG, WebP up to 10MB
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
