import React from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

export default function PropertyPanel() {
  const { selectedId, excelData, setQrBoundColumn, qrBoundColumn } = useEditorContext();

  // In a real implementation, we would fetch the properties of the active fabric object here.
  // For the skeleton, we'll display a generic panel based on whether an object is selected.
  // Ideally, use a custom hook to bridge active object properties to React state.

  const isQR = selectedId?.startsWith('qr_');
  const isText = selectedId?.startsWith('text_');

  if (!selectedId) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-surface-200">
          <h2 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-sm text-surface-500">
            Select an element on the canvas to edit its properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-surface-200">
        <h2 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
          {isQR ? 'QR Code Properties' : 'Text Properties'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* QR Specific Properties */}
        {isQR && (
          <div className="space-y-4">
             <div>
               <label className="block text-xs font-medium text-surface-700 mb-1">
                 Bind Verification To (Required)
               </label>
               <select 
                 className="w-full text-sm rounded-lg border border-surface-300 p-2 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                 value={qrBoundColumn || ''}
                 onChange={(e) => setQrBoundColumn(e.target.value)}
               >
                 <option value="" disabled>Select Excel Column</option>
                 {excelData?.headers.map(h => (
                   <option key={h} value={h}>{h}</option>
                 ))}
               </select>
               <p className="text-xs text-surface-500 mt-1">
                 This value will be shown on the public verification page when scanned. Usually the recipient's Name or ID.
               </p>
             </div>
             
             {/* Dummy Color Pickers for QR */}
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-medium text-surface-700 mb-1">Dark Color</label>
                 <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 rounded border border-surface-200 bg-black cursor-pointer"></div>
                   <span className="text-xs text-surface-600 font-mono">#000000</span>
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-medium text-surface-700 mb-1">Light Color</label>
                 <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 rounded border border-surface-200 bg-white cursor-pointer"></div>
                   <span className="text-xs text-surface-600 font-mono">#FFFFFF</span>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Text Specific Properties */}
        {isText && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1">Font Family</label>
              <select className="w-full text-sm rounded-lg border border-surface-300 p-2 outline-none focus:ring-2 focus:ring-primary-500">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Playfair Display</option>
                <option>Montserrat</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-700 mb-1">Font Size</label>
                <div className="flex items-center border border-surface-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                  <input type="number" className="w-full p-2 text-sm outline-none" defaultValue={24} />
                  <span className="px-2 text-xs text-surface-500 bg-surface-50 border-l border-surface-200">px</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-surface-700 mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded border border-surface-200 bg-black cursor-pointer"></div>
                  <span className="text-xs text-surface-600 font-mono">#000000</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1">Alignment</label>
              <div className="flex bg-surface-100 rounded-lg p-1">
                <button className="flex-1 flex justify-center py-1.5 rounded hover:bg-surface-200 text-surface-600">
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button className="flex-1 flex justify-center py-1.5 rounded bg-white shadow-sm text-primary-600">
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button className="flex-1 flex justify-center py-1.5 rounded hover:bg-surface-200 text-surface-600">
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
               <label className="block text-xs font-medium text-surface-700 mb-1">Style</label>
               <div className="flex space-x-2">
                  <button className="p-2 rounded border border-surface-200 hover:bg-surface-50 text-surface-600">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded border border-surface-200 hover:bg-surface-50 text-surface-600">
                    <Italic className="w-4 h-4" />
                  </button>
               </div>
            </div>
            
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
              <div className="flex items-start">
                <Type className="w-4 h-4 text-primary-500 mt-0.5 mr-2 shrink-0" />
                <p className="text-xs text-primary-700">
                  Text is center-anchored by default. It will expand evenly in both directions. 
                  Long text will automatically shrink to fit bounds.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
