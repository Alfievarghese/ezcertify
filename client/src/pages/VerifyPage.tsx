import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Calendar, FileText } from 'lucide-react';

interface CertDetails {
  id: string;
  templateName: string;
  generatedAt: string;
  [key: string]: string; // Other bound fields
}

export default function VerifyPage() {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [details, setDetails] = useState<CertDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verifyCert = async () => {
      try {
        const res = await api.get(`/api/verify/${certificateId}`);
        setVerified(res.data.verified);
        setDetails(res.data.certificate);
      } catch (err: any) {
        setVerified(false);
        setErrorMsg(err.response?.data?.message || 'Verification service unavailable');
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCert();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-surface-500 font-medium">Verifying certificate...</p>
      </div>
    );
  }

  // Filter out internal fields to display the bound data
  const displayFields = details ? Object.entries(details).filter(
    ([key]) => !['id', 'templateName', 'generatedAt'].includes(key)
  ) : [];

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-card overflow-hidden"
      >
        <div className={`h-3 w-full ${verified ? 'bg-success-500' : 'bg-danger-500'}`} />
        
        <div className="p-8 text-center border-b border-surface-100">
          {verified ? (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-success-50 rounded-full mb-4"
            >
              <CheckCircle className="w-10 h-10 text-success-500" />
            </motion.div>
          ) : (
             <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-danger-50 rounded-full mb-4"
            >
              <XCircle className="w-10 h-10 text-danger-500" />
            </motion.div>
          )}
          
          <h1 className={`text-2xl font-bold mb-2 ${verified ? 'text-surface-900' : 'text-danger-600'}`}>
            {verified ? 'Verified Authentic' : 'Invalid Certificate'}
          </h1>
          
          <p className="text-surface-500 text-sm">
            {verified 
              ? 'This certificate was officially issued and matches our records.'
              : errorMsg || 'This certificate ID could not be found in our database.'
            }
          </p>
        </div>

        {verified && details && (
          <div className="p-8 space-y-6">
             <div className="space-y-4">
                {/* Main bound data (usually Name) */}
                {displayFields.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">{key}</p>
                    <p className="text-lg font-medium text-surface-900">{value}</p>
                  </div>
                ))}
             </div>

             <div className="bg-surface-50 rounded-xl p-4 space-y-3 mt-6 border border-surface-100">
                <div className="flex items-center text-sm">
                   <Calendar className="w-4 h-4 text-surface-400 mr-3 shrink-0" />
                   <div>
                     <p className="text-xs text-surface-500">Issued On</p>
                     <p className="font-medium text-surface-900">
                        {new Date(details.generatedAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                     </p>
                   </div>
                </div>
                
                <div className="flex items-center text-sm">
                   <FileText className="w-4 h-4 text-surface-400 mr-3 shrink-0" />
                   <div>
                     <p className="text-xs text-surface-500">Certificate ID</p>
                     <p className="font-mono text-xs font-medium text-surface-900 break-all">{details.id}</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
