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
    <div className="flex flex-col h-full bg-surface-900 border-r border-surface-800">
      <div className="p-4 border-b border-surface-800">
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          Data Fields
        </h2>
        <p className="text-[11px] text-surface-500 mt-1">
          Drag fields onto the canvas to create placeholders.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Special QR Code Placeholder */}
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-surface-500 tracking-wider mb-2">VERIFICATION</h3>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            draggable
            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, 'qr')}
            className="flex items-center p-3 bg-surface-800 border border-surface-700 rounded cursor-grab active:cursor-grabbing hover:border-primary-500 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-surface-500 mr-2 shrink-0" />
            <QrCode className="w-4 h-4 text-primary-400 mr-3 shrink-0" />
            <span className="text-sm font-medium text-surface-200 truncate">
              QR Code
            </span>
          </motion.div>
        </div>

        {/* Excel Columns */}
        <div>
          <h3 className="text-[10px] font-bold text-surface-500 tracking-wider mb-2">EXCEL COLUMNS</h3>
          <div className="space-y-2">
            {excelData.headers.map((header) => (
              <motion.div
                key={header}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, 'text', header)}
                className="flex items-center p-3 bg-surface-800 border border-surface-700 rounded cursor-grab active:cursor-grabbing hover:border-primary-500 transition-colors group"
              >
                <GripVertical className="w-4 h-4 text-surface-600 group-hover:text-surface-500 mr-2 shrink-0 transition-colors" />
                <Type className="w-4 h-4 text-surface-500 group-hover:text-surface-400 mr-3 shrink-0 transition-colors" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-surface-200 truncate">
                    {header}
                  </span>
                  {/* Preview first row data */}
                  <span className="text-[11px] text-surface-500 truncate mt-0.5">
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
