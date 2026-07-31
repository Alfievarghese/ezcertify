import React from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type as TypeIcon } from 'lucide-react';

export default function PropertyPanel() {
  const { 
    selectedId, 
    excelData, 
    qrBoundColumn, 
    setQrBoundColumn,
    activeObjectProps,
    setPropertyUpdateSignal
  } = useEditorContext();

  const isQR = selectedId?.startsWith('qr_');
  const isText = selectedId?.startsWith('text_');

  const updateProp = (key: string, value: any) => {
    if (setPropertyUpdateSignal) {
      setPropertyUpdateSignal({ key, value, timestamp: Date.now() });
    }
  };

  if (!selectedId || !activeObjectProps) {
    return (
      <div className="flex flex-col h-full bg-surface-900 border-l border-surface-800 text-surface-200">
        <div className="p-4 border-b border-surface-800">
          <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
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
    <div className="flex flex-col h-full bg-surface-900 border-l border-surface-800 text-surface-200">
      <div className="p-4 border-b border-surface-800">
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {isQR ? 'QR Code Properties' : 'Text Properties'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* QR Specific Properties */}
        {isQR && (
          <div className="space-y-4">
             <div>
               <label className="block text-xs font-medium text-surface-400 mb-1.5">
                 Bind Verification To (Required)
               </label>
               <select 
                 className="w-full text-sm rounded border border-surface-700 bg-surface-800 p-2 text-surface-100 outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                 value={qrBoundColumn || ''}
                 onChange={(e) => setQrBoundColumn(e.target.value)}
               >
                 <option value="" disabled>Select Excel Column</option>
                 {excelData?.headers.map(h => (
                   <option key={h} value={h}>{h}</option>
                 ))}
               </select>
               <p className="text-[11px] text-surface-500 mt-1.5">
                 This value will be shown on the public verification page when scanned. Usually the recipient's Name or ID.
               </p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-medium text-surface-400 mb-1.5">Dark Color</label>
                 <div className="flex items-center space-x-2">
                   <div className="w-6 h-6 rounded border border-surface-700 bg-black cursor-pointer"></div>
                   <span className="text-xs text-surface-400 font-mono">#000000</span>
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-medium text-surface-400 mb-1.5">Light Color</label>
                 <div className="flex items-center space-x-2">
                   <div className="w-6 h-6 rounded border border-surface-700 bg-white cursor-pointer"></div>
                   <span className="text-xs text-surface-400 font-mono">#FFFFFF</span>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Text Specific Properties */}
        {isText && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Font Family</label>
              <select 
                className="w-full text-sm rounded border border-surface-700 bg-surface-800 p-2 text-surface-100 outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={activeObjectProps.fontFamily || 'Inter'}
                onChange={(e) => updateProp('fontFamily', e.target.value)}
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Font Size</label>
                <div className="flex items-center border border-surface-700 bg-surface-800 rounded overflow-hidden focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500">
                  <input 
                    type="number" 
                    className="w-full p-2 text-sm outline-none bg-transparent text-surface-100" 
                    value={activeObjectProps.fontSize ? Math.round(activeObjectProps.fontSize) : 24}
                    onChange={(e) => updateProp('fontSize', parseInt(e.target.value) || 24)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Fill Color</label>
                <div className="flex items-center border border-surface-700 bg-surface-800 rounded overflow-hidden focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500">
                  <input 
                    type="color" 
                    className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer ml-1" 
                    value={activeObjectProps.fill || '#000000'}
                    onChange={(e) => updateProp('fill', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="w-full p-2 text-sm outline-none bg-transparent text-surface-100 uppercase"
                    value={activeObjectProps.fill || '#000000'}
                    onChange={(e) => updateProp('fill', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Alignment</label>
              <div className="flex bg-surface-800 rounded p-1 border border-surface-700">
                <button 
                  onClick={() => updateProp('textAlign', 'left')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${activeObjectProps.textAlign === 'left' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'}`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateProp('textAlign', 'center')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${activeObjectProps.textAlign === 'center' || !activeObjectProps.textAlign ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'}`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateProp('textAlign', 'right')}
                  className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${activeObjectProps.textAlign === 'right' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'}`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
               <label className="block text-xs font-medium text-surface-400 mb-1.5">Style</label>
               <div className="flex space-x-2">
                  <button 
                    onClick={() => updateProp('fontWeight', activeObjectProps.fontWeight === 'bold' ? 'normal' : 'bold')}
                    className={`p-2 rounded border transition-colors ${activeObjectProps.fontWeight === 'bold' ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : 'border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200'}`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => updateProp('fontStyle', activeObjectProps.fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={`p-2 rounded border transition-colors ${activeObjectProps.fontStyle === 'italic' ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : 'border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200'}`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
               </div>
            </div>
            
            <div className="p-3 bg-surface-800/50 rounded border border-surface-800 mt-8">
              <div className="flex items-start">
                <TypeIcon className="w-4 h-4 text-surface-500 mt-0.5 mr-2 shrink-0" />
                <p className="text-[11px] text-surface-400 leading-relaxed">
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
