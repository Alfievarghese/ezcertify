import React from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { Type, QrCode, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ColumnSidebar() {
  const { excelData } = useEditorContext();

  if (!excelData) return null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: string, column?: string) => {
    e.dataTransfer.setData('type', type);
    if (column) {
      e.dataTransfer.setData('column', column);
    }
    // Set drag image/effect
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-surface-200">
        <h2 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
          Data Fields
        </h2>
        <p className="text-xs text-surface-500 mt-1">
          Drag fields onto the certificate to create placeholders.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Special QR Code Placeholder */}
        <div className="mb-6">
          <h3 className="text-xs font-medium text-surface-500 mb-2">VERIFICATION</h3>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            draggable
            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, 'qr')}
            className="flex items-center p-3 bg-surface-50 border border-surface-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-primary-300 hover:shadow-sm transition-all"
          >
            <GripVertical className="w-4 h-4 text-surface-400 mr-2 shrink-0" />
            <QrCode className="w-4 h-4 text-primary-500 mr-3 shrink-0" />
            <span className="text-sm font-medium text-surface-900 truncate">
              QR Code
            </span>
          </motion.div>
        </div>

        {/* Excel Columns */}
        <div>
          <h3 className="text-xs font-medium text-surface-500 mb-2">EXCEL COLUMNS</h3>
          <div className="space-y-2">
            {excelData.headers.map((header) => (
              <motion.div
                key={header}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, 'text', header)}
                className="flex items-center p-3 bg-surface-50 border border-surface-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <GripVertical className="w-4 h-4 text-surface-400 mr-2 shrink-0" />
                <Type className="w-4 h-4 text-surface-500 mr-3 shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-surface-900 truncate">
                    {header}
                  </span>
                  {/* Preview first row data */}
                  <span className="text-xs text-surface-500 truncate mt-0.5">
                    eg. {excelData.previewRows[0]?.[header] || 'Empty'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
