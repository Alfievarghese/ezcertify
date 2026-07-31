import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorContext } from '../context/EditorContext';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import Loader from '../components/ui/3d-box-loader-animation';
import { generateCertificatesClientSide } from '../lib/clientRenderer';

export default function GeneratePage() {
  const navigate = useNavigate();
  const { sessionId, excelData, templateData, qrBoundColumn, placeholders } = useEditorContext();
  
  const [status, setStatus] = useState<'starting' | 'active' | 'completed' | 'failed'>('starting');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !excelData || !templateData) {
      navigate('/');
      return;
    }

    // Rows to generate — prefer full rows, fallback to previewRows
    const rows = excelData.rows || excelData.previewRows || [];
    if (rows.length === 0) {
      setStatus('failed');
      setError('No data rows found. Please re-upload your Excel file.');
      return;
    }

    setTotal(rows.length);

    const startGeneration = async () => {
      try {
        // Use exact placeholders from canvas context, or sensible fallback
        const actualPlaceholders = (placeholders && placeholders.length > 0)
          ? [...placeholders]
          : [
              {
                id: 'text_fallback',
                type: 'text' as const,
                x: 50,
                y: 50,
                boundColumn: excelData.headers[0],
                fontFamily: 'Inter',
                fontSize: 32,
                fontColor: '#000000',
                textAlign: 'center' as const,
              }
            ];

        // Append QR placeholder if bound but not already present
        if (qrBoundColumn && !actualPlaceholders.some((p: any) => p.type === 'qr')) {
          actualPlaceholders.push({
            id: 'qr_fallback',
            type: 'qr' as const,
            x: 50,
            y: 80,
            boundColumn: qrBoundColumn,
            qrSize: 120,
            qrDarkColor: '#000000',
            qrLightColor: '#ffffff',
          });
        }
        
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const fullUrl = templateData.url.startsWith('http') ? templateData.url : `${baseUrl}${templateData.url}`;
        
        setStatus('active');
        
        await generateCertificatesClientSide({
          layout: {
             templateUrl: fullUrl,
             templateWidth: templateData.width,
             templateHeight: templateData.height,
             placeholders: actualPlaceholders,
          },
          rows,
          outputFormat: 'png',
          qrBoundColumn: qrBoundColumn || '',
          onProgress: (cur, tot) => {
             setCurrent(cur);
             setTotal(tot);
             setProgress(Math.round((cur / tot) * 100));
          },
          onComplete: () => {
             setStatus('completed');
             setCurrent(rows.length);
             setProgress(100);
          },
          onError: (err) => {
             setStatus('failed');
             setError(err);
          },
        });
      } catch (err: any) {
        setStatus('failed');
        setError(err.message || 'Failed to start client generation');
      }
    };

    startGeneration();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-card p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Generating Certificates</h1>
          <p className="text-surface-500 text-sm">
            Please wait while we process your request. This may take a few moments for large batches.
          </p>
        </div>

        {(status === 'starting' || status === 'active') && (
           <div className="flex flex-col items-center justify-center pt-4 pb-8 overflow-hidden">
             <div className="transform scale-75 origin-center h-[240px] flex items-center justify-center">
               <Loader />
             </div>
             {status === 'active' && (
               <div className="w-full mt-4">
                 <ProgressBar 
                   progress={progress} 
                   label={`Processing... (${current} of ${total})`} 
                   status="active"
                 />
               </div>
             )}
           </div>
        )}

        {status === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-surface-900">Successfully Generated!</h2>
              <p className="text-surface-500 mt-1">All {total} certificates are ready for download.</p>
            </div>

            <Button 
              size="lg" 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              Start New Batch
            </Button>
          </motion.div>
        )}

        {status === 'failed' && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-surface-900">Generation Failed</h2>
              <p className="text-danger-600 mt-2 text-sm bg-danger-50 p-3 rounded-lg border border-danger-100 text-left">
                {error}
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/editor')}
            >
              Back to Editor
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
