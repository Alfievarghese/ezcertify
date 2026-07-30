import { useState } from 'react';
import axios from 'axios';
import { useEditorContext } from '../context/EditorContext';

export function useTemplateData() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { setTemplateData, setSessionId, sessionId } = useEditorContext();

  const uploadTemplate = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload/template', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
      setTemplateData(response.data.template);

      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to upload template file');
      return false;
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  return {
    uploadTemplate,
    isUploading,
    uploadProgress,
    error,
  };
}
