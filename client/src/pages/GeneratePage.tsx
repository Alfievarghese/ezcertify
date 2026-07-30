import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { useEditorContext } from '../context/EditorContext';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';

export default function GeneratePage() {
  const navigate = useNavigate();
  const { sessionId, excelData, templateData, qrBoundColumn } = useEditorContext();
  
  const [status, setStatus] = useState<'starting' | 'active' | 'completed' | 'failed'>('starting');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(excelData?.totalRows || 0);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId || !excelData || !templateData || !qrBoundColumn) {
      navigate('/');
      return;
    }

    const startGeneration = async () => {
      try {
        // In a real app, you'd get the placeholders from the canvas context
        // For this skeleton, we'll assume a dummy placeholder
        const layoutPayload = {
          sessionId,
          qrBoundColumn,
          outputFormat: 'pdf',
          placeholders: [
             {
               id: 'test',
               type: 'text',
               x: 50,
               y: 50,
               boundColumn: excelData.headers[0],
               fontFamily: 'Inter',
               fontSize: 32,
               fontColor: '#000000',
               textAlign: 'center'
             },
             {
               id: 'qr_test',
               type: 'qr',
               x: 50,
               y: 80,
               qrSize: 120,
               qrDarkColor: '#000000',
               qrLightColor: '#ffffff'
             }
          ]
        };

        const res = await axios.post('/api/generate', layoutPayload);
        const newJobId = res.data.jobId;
        setJobId(newJobId);
        setStatus('active');
        
        // Setup SSE for progress
        const sseUrl = `/api/generate/${newJobId}/status`;
        const es = new EventSource(sseUrl);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.status === 'completed') {
            setStatus('completed');
            setCurrent(data.total);
            setProgress(100);
            es.close();
          } else if (data.status === 'failed') {
            setStatus('failed');
            setError(data.error || 'Generation failed');
            es.close();
          } else {
            setCurrent(data.current || 0);
            setTotal(data.total || 0);
            setProgress(data.total ? Math.round((data.current / data.total) * 100) : 0);
          }
        };

        es.onerror = () => {
          // Ignore connection resets if we're done
          if (status !== 'completed' && status !== 'failed') {
             setError('Lost connection to server while monitoring progress.');
             setStatus('failed');
             es.close();
          }
        };

      } catch (err: any) {
        setStatus('failed');
        setError(err.response?.data?.error || err.message || 'Failed to start generation');
      }
    };

    startGeneration();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleDownload = () => {
    if (jobId) {
      window.location.href = `/api/generate/${jobId}/download`;
    }
  };

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

        {status === 'starting' && (
           <div className="flex justify-center p-8">
             <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
           </div>
        )}

        {status === 'active' && (
          <div className="space-y-6">
            <ProgressBar 
              progress={progress} 
              label={`Processing... (${current} of ${total})`} 
              status="active"
            />
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
              onClick={handleDownload}
              leftIcon={<Download className="w-5 h-5" />}
            >
              Download ZIP Archive
            </Button>
            
            <Button 
              variant="ghost" 
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
