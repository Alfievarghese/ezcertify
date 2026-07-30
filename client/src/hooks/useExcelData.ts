import { useState } from 'react';
import { api } from '../lib/api';
import { useEditorContext } from '../context/EditorContext';

export function useExcelData() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { setExcelData, setSessionId, sessionId } = useEditorContext();

  const uploadExcel = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload/excel', formData, {
        headers: {
          ...(sessionId ? { 'x-session-id': sessionId } : {}),
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded)
          );
          setUploadProgress(percentCompleted);
        },
      });

      setSessionId(response.data.sessionId);
      setExcelData({
        headers: response.data.headers,
        previewRows: response.data.previewRows,
        totalRows: response.data.totalRows,
        warnings: response.data.warnings,
      });

      return true;
    } catch (err: any) {
      const responseError = err.response?.data?.error;
      const errorMessage = typeof responseError === 'object' && responseError !== null
        ? (responseError.message || JSON.stringify(responseError))
        : responseError;
      setError(errorMessage || err.message || 'Failed to upload Excel file');
      return false;
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  return {
    uploadExcel,
    isUploading,
    uploadProgress,
    error,
  };
}
