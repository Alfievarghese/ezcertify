import React, { useEffect, useState } from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValidationChecklistProps {
  onValidationChange: (isValid: boolean) => void;
}

export default function ValidationChecklist({ onValidationChange }: ValidationChecklistProps) {
  const { excelData, templateData, qrBoundColumn } = useEditorContext();
  const [isOpen, setIsOpen] = useState(false);

  // In a real app, this would dynamically check the canvas context
  // to ensure all required bindings are met. For the skeleton,
  // we use basic checks based on context.
  
  const hasData = !!excelData;
  const hasTemplate = !!templateData;
  const hasQRBound = !!qrBoundColumn;
  // This is a simplification; ideally we'd check if any placeholders exist.
  const allChecksPassed = hasData && hasTemplate && hasQRBound;

  useEffect(() => {
    onValidationChange(allChecksPassed);
  }, [allChecksPassed, onValidationChange]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          allChecksPassed 
            ? 'bg-success-50 text-success-700 hover:bg-success-100' 
            : 'bg-warning-50 text-warning-700 hover:bg-warning-100'
        }`}
      >
        {allChecksPassed ? (
          <CheckCircle2 className="w-4 h-4 mr-2" />
        ) : (
          <AlertTriangle className="w-4 h-4 mr-2" />
        )}
        {allChecksPassed ? 'Ready to Generate' : 'Action Required'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-card border border-surface-200 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-surface-100 bg-surface-50">
              <h3 className="font-semibold text-surface-900">Pre-flight Checklist</h3>
              <p className="text-xs text-surface-500 mt-1">Complete these steps before generating.</p>
            </div>
            
            <div className="p-4 space-y-4">
              <CheckItem 
                label="Data Source Uploaded" 
                passed={hasData} 
                details={hasData ? `${excelData.totalRows} rows found` : 'Missing Excel/CSV file'}
              />
              <CheckItem 
                label="Template Uploaded" 
                passed={hasTemplate} 
                details={hasTemplate ? templateData.originalName : 'Missing background image'}
              />
              <CheckItem 
                label="QR Code Bound" 
                passed={hasQRBound} 
                details={hasQRBound ? `Bound to: ${qrBoundColumn}` : 'Select the QR code and bind a column'}
              />
              
              {/* Warnings from parser */}
              {excelData?.warnings && excelData.warnings.length > 0 && (
                <div className="pt-2 mt-2 border-t border-surface-100">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5 mr-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-warning-700">Data Warnings</p>
                      <p className="text-xs text-warning-600 mt-0.5">
                        Found {excelData.warnings.length} potential issues (empty cells or duplicates).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckItem({ label, passed, details }: { label: string; passed: boolean; details: string }) {
  return (
    <div className="flex items-start">
      {passed ? (
        <CheckCircle2 className="w-4 h-4 text-success-500 mt-0.5 mr-3 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-surface-300 mt-0.5 mr-3 shrink-0" />
      )}
      <div>
        <p className={`text-sm font-medium ${passed ? 'text-surface-900' : 'text-surface-500'}`}>
          {label}
        </p>
        <p className="text-xs text-surface-500 mt-0.5">{details}</p>
      </div>
    </div>
  );
}
