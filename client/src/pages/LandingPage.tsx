import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { FileDropzone } from '../components/ui/FileDropzone';
import { Button } from '../components/ui/Button';
import { useExcelData } from '../hooks/useExcelData';
import { useTemplateData } from '../hooks/useTemplateData';
import { useEditorContext } from '../context/EditorContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { excelData, templateData } = useEditorContext();
  const { uploadExcel, isUploading: isExcelUploading, uploadProgress: excelProgress, error: excelError } = useExcelData();
  const { uploadTemplate, isUploading: isTemplateUploading, uploadProgress: templateProgress, error: templateError } = useTemplateData();

  const handleExcelSelect = (file: File) => uploadExcel(file);
  const handleTemplateSelect = (file: File) => uploadTemplate(file);

  const canProceed = excelData && templateData;

  const handleProceed = () => {
    if (canProceed) {
      navigate('/editor');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900">
            Bulk Certificate Generator
          </h1>
          <p className="text-lg text-surface-600 max-w-2xl mx-auto">
            Upload your data, design the layout visually, and generate hundreds of verifiable certificates in seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Step 1: Excel Upload */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-card flex flex-col h-full"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                1
              </div>
              <h2 className="text-xl font-semibold text-surface-900">Upload Data</h2>
            </div>
            
            <div className="flex-grow flex flex-col justify-center">
              <FileDropzone
                onFileSelect={handleExcelSelect}
                accept=".xlsx,.csv"
                label="Select Excel or CSV file"
                description="First row must contain column headers"
                icon={<FileSpreadsheet className="w-8 h-8" />}
                isUploading={isExcelUploading}
                progress={excelProgress}
                error={excelError}
                uploadedFileName={excelData ? 'Data uploaded successfully' : null}
              />
            </div>
            
            {excelData && (
              <div className="mt-4 text-sm text-surface-500 animate-fade-in text-center">
                Found {excelData.headers.length} columns and {excelData.totalRows} rows
              </div>
            )}
          </motion.div>

          {/* Step 2: Template Upload */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-card flex flex-col h-full"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${excelData ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-400'}`}>
                2
              </div>
              <h2 className={`text-xl font-semibold transition-colors ${excelData ? 'text-surface-900' : 'text-surface-400'}`}>
                Upload Template
              </h2>
            </div>
            
            <div className={`flex-grow flex flex-col justify-center transition-opacity ${!excelData ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <FileDropzone
                onFileSelect={handleTemplateSelect}
                accept=".png,.jpg,.jpeg,.webp"
                label="Select template image"
                description="High-resolution PNG or JPG recommended"
                icon={<ImageIcon className="w-8 h-8" />}
                isUploading={isTemplateUploading}
                progress={templateProgress}
                error={templateError}
                uploadedFileName={templateData?.originalName}
              />
            </div>
          </motion.div>
        </div>

        {/* Step 3: Proceed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center pt-4"
        >
          <Button
            size="lg"
            disabled={!canProceed}
            onClick={handleProceed}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className={`w-full sm:w-auto px-12 ${!canProceed ? 'opacity-50' : 'animate-pulse'}`}
            style={canProceed ? { animationIterationCount: 3 } : {}}
          >
            Design Layout
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
