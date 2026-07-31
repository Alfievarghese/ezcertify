import React, { useState } from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { Button } from '../ui/Button';
import { X, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface MappingPreviewProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function MappingPreview({ onClose, onConfirm }: MappingPreviewProps) {
  const { excelData, qrBoundColumn, placeholders } = useEditorContext();
  const [isStarting, setIsStarting] = useState(false);

  if (!excelData) return null;

  // Show ALL columns that have been placed on the canvas
  const boundColumns = (placeholders || [])
    .filter((p: any) => p.type === 'text' && p.boundColumn)
    .map((p: any) => p.boundColumn);
  
  // Fallback: if no placeholders placed yet, show first 3 headers  
  const mappedColumns = boundColumns.length > 0 
    ? [...new Set(boundColumns)] as string[]
    : excelData.headers.slice(0, 3);
  
  if (qrBoundColumn && !mappedColumns.includes(qrBoundColumn)) {
      mappedColumns.push(qrBoundColumn);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">Verify Mapping & Preview</h2>
            <p className="text-sm text-surface-500">Confirm your data maps correctly to the placeholders before generating.</p>
          </div>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-600 rounded-full hover:bg-surface-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-surface-50">
          {/* Show which tags are placed on canvas */}
          {(placeholders || []).length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 mb-1">
                {placeholders.filter((p: any) => p.type === 'text').length} text field(s) placed on canvas
                {placeholders.some((p: any) => p.type === 'qr') && ' + QR Code'}
              </p>
              <p className="text-xs text-blue-600">
                Bound columns: {boundColumns.join(', ') || 'None'}
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-surface-500 uppercase bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Row</th>
                    {mappedColumns.map(col => (
                      <th key={col} className="px-6 py-4 font-medium">
                        {col}
                        {col === qrBoundColumn && (
                           <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary-100 text-primary-700">
                             QR Bound
                           </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {excelData.previewRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-50/50">
                      <td className="px-6 py-4 font-medium text-surface-900 whitespace-nowrap">
                        {idx + 2}
                      </td>
                      {mappedColumns.map(col => (
                        <td key={col} className="px-6 py-4 text-surface-600">
                          {row[col] || <span className="text-surface-300 italic">Empty</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-surface-500">
             <span>Showing 5 of {excelData.totalRows} rows</span>
             {excelData.warnings.length > 0 && (
                <span className="text-warning-600 font-medium">
                  {excelData.warnings.length} warnings detected
                </span>
             )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-surface-200 bg-white flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isStarting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            disabled={isStarting}
            onClick={() => {
              setIsStarting(true);
              setTimeout(() => onConfirm(), 100);
            }}
            rightIcon={isStarting ? undefined : <Play className="w-4 h-4" />}
          >
            {isStarting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Starting...
              </span>
            ) : 'Start Generation'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
