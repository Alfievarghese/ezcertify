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
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Data Fields
        </h2>
        <p className="text-[11px] text-gray-500 mt-1">
          Drag fields onto the canvas.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Special QR Code Placeholder */}
        <div>
          <h3 className="text-[10px] font-semibold text-gray-500 tracking-wider mb-2 uppercase">Verification</h3>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            draggable
            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, 'qr')}
            className="flex items-center p-3 bg-[#222] border border-[#333] rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-500 hover:bg-[#2a2a2a] transition-colors"
          >
            <GripVertical className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <QrCode className="w-4 h-4 text-blue-400 mr-3 shrink-0" />
            <span className="text-sm font-medium text-gray-200 truncate">
              QR Code
            </span>
          </motion.div>
        </div>

        {/* Excel Columns */}
        <div>
          <h3 className="text-[10px] font-semibold text-gray-500 tracking-wider mb-2 uppercase">Excel Columns</h3>
          <div className="space-y-2">
            {excelData.headers.map((header) => (
              <motion.div
                key={header}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, 'text', header)}
                className="flex items-center p-3 bg-[#222] border border-[#333] rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-500 hover:bg-[#2a2a2a] transition-colors group"
              >
                <GripVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-500 mr-2 shrink-0 transition-colors" />
                <Type className="w-4 h-4 text-gray-500 group-hover:text-gray-400 mr-3 shrink-0 transition-colors" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-gray-200 truncate">
                    {header}
                  </span>
                  {/* Preview first row data */}
                  <span className="text-[11px] text-gray-500 truncate mt-0.5">
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
