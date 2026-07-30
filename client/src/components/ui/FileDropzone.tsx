import React, { useCallback, useState } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSizeMB?: number;
  label: string;
  description: string;
  icon?: React.ReactNode;
  isUploading?: boolean;
  progress?: number;
  error?: string | null;
  uploadedFileName?: string | null;
}

export function FileDropzone({
  onFileSelect,
  accept,
  maxSizeMB = 50,
  label,
  description,
  icon,
  isUploading = false,
  progress = 0,
  error = null,
  uploadedFileName = null,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      setLocalError(null);

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [accept, maxSizeMB, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalError(null);
      const files = e.target.files;
      handleFiles(files);
    },
    [accept, maxSizeMB, onFileSelect]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setLocalError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    // Basic extension check
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = accept.split(',').map(t => t.trim());
    
    // Check if accept contains extension or mimetype
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
         return type === extension;
      }
      // Very basic mime check for this specific app's needs
      if (type.startsWith('image/')) return file.type.startsWith('image/');
      return file.type === type;
    });

    if (!isValidType && accept !== '*') {
      setLocalError(`Invalid file type. Accepted types: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      <div
        className={`relative w-full overflow-hidden rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
          isDragActive
            ? 'dropzone-active bg-primary-50/50'
            : displayError
            ? 'dropzone-reject bg-danger-50/30'
            : uploadedFileName
            ? 'border-success-400 bg-success-50/20'
            : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50/50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
              <div className="text-primary-500">
                 <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm font-medium text-surface-700">Uploading... {progress}%</p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-200">
                <div
                  className="h-full bg-primary-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : uploadedFileName ? (
            <>
              <div className="rounded-full bg-success-100 p-3 text-success-600">
                <File className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">{uploadedFileName}</p>
                <p className="mt-1 text-xs text-surface-500">Click or drag to replace</p>
              </div>
            </>
          ) : (
            <>
              <div className={`rounded-full p-4 ${displayError ? 'bg-danger-100 text-danger-600' : 'bg-primary-50 text-primary-500'}`}>
                {icon || <UploadCloud className="h-8 w-8" />}
              </div>
              <div>
                <p className="text-base font-medium text-surface-900">{label}</p>
                <p className="mt-1 text-sm text-surface-500">{description}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {displayError && (
        <div className="mt-2 flex items-center space-x-1.5 text-sm text-danger-600 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{displayError}</p>
        </div>
      )}
    </div>
  );
}
