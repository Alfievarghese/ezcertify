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
      <div className="p-5 border-b-4 border-black bg-[#fef08a]">
        <h2 className="text-sm font-black text-black uppercase tracking-tighter">
          Data Fields
        </h2>
        <p className="text-xs text-black font-medium mt-1">
          Drag fields onto the canvas.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Special QR Code Placeholder */}
        <div>
          <h3 className="text-xs font-black text-black tracking-tighter mb-3 uppercase">Verification</h3>
          <motion.div
            whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
            whileTap={{ x: 4, y: 4, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
            draggable
            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, 'qr')}
            className="flex items-center p-3 bg-[#bbf7d0] border-2 border-black rounded-none cursor-grab active:cursor-grabbing shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <GripVertical className="w-5 h-5 text-black mr-2 shrink-0" />
            <QrCode className="w-5 h-5 text-black mr-3 shrink-0" />
            <span className="text-sm font-bold text-black truncate">
              QR Code
            </span>
          </motion.div>
        </div>

        {/* Excel Columns */}
        <div>
          <h3 className="text-xs font-black text-black tracking-tighter mb-3 uppercase">Excel Columns</h3>
          <div className="space-y-4">
            {excelData.headers.map((header) => (
              <motion.div
                key={header}
                whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                whileTap={{ x: 4, y: 4, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, 'text', header)}
                className="flex items-center p-3 bg-white border-2 border-black rounded-none cursor-grab active:cursor-grabbing shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
              >
                <GripVertical className="w-5 h-5 text-black mr-2 shrink-0" />
                <Type className="w-5 h-5 text-black mr-3 shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-black truncate">
                    {header}
                  </span>
                  {/* Preview first row data */}
                  <span className="text-xs font-medium text-gray-600 truncate mt-0.5">
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
