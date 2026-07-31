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
  const { excelData, qrBoundColumn } = useEditorContext();
  const [isStarting, setIsStarting] = useState(false);

  if (!excelData) return null;

  // In a real app, we'd get the bound columns from the canvas placeholders.
  // For the skeleton, we'll assume a few columns are mapped.
  const mappedColumns = excelData.headers.slice(0, 3);
  
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
                        {idx + 2} {/* +2 because header is row 1, data starts row 2 */}
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
            isLoading={isStarting}
            disabled={isStarting}
            onClick={() => {
              setIsStarting(true);
              onConfirm();
            }}
            rightIcon={!isStarting ? <Play className="w-4 h-4" /> : undefined}
          >
            {isStarting ? 'Starting...' : 'Start Generation'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
