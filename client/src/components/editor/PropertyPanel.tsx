import React from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline as UnderlineIcon, Type as TypeIcon } from 'lucide-react';

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
      <div className="flex flex-col h-full bg-transparent">
        <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-sm text-gray-500">
            Select an element on the canvas to edit its properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {isQR ? 'QR Properties' : 'Text Properties'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Common Properties */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">Rotation Angle</label>
          <div className="flex items-center bg-[#222] border border-[#333] rounded-lg focus-within:border-blue-500 transition-colors overflow-hidden">
            <input 
              type="number" 
              className="w-full p-2 text-sm outline-none bg-transparent text-gray-200" 
              value={activeObjectProps.angle ? Math.round(activeObjectProps.angle) : 0}
              onChange={(e) => updateProp('angle', parseFloat(e.target.value) || 0)}
            />
            <span className="px-3 text-gray-500 text-sm">°</span>
          </div>
        </div>
        {/* QR Specific Properties */}
        {isQR && (
          <div className="space-y-6">
             <div>
               <label className="block text-xs font-semibold text-gray-400 mb-2">
                 Bind Verification To
               </label>
               <select 
                 className="w-full text-sm bg-[#222] border border-[#333] rounded-lg p-2 text-gray-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                 value={qrBoundColumn || ''}
                 onChange={(e) => setQrBoundColumn(e.target.value)}
               >
                 <option value="" disabled>Select Excel Column</option>
                 {excelData?.headers.map(h => (
                   <option key={h} value={h}>{h}</option>
                 ))}
               </select>
               <p className="text-[11px] text-gray-500 mt-2">
                 Value shown on verification page when scanned.
               </p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-semibold text-gray-400 mb-2">Dark Color</label>
                 <div className="flex items-center space-x-2">
                   <div className="w-6 h-6 rounded border border-[#333] bg-black cursor-pointer"></div>
                   <span className="text-xs text-gray-400 font-mono">#000000</span>
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-semibold text-gray-400 mb-2">Light Color</label>
                 <div className="flex items-center space-x-2">
                   <div className="w-6 h-6 rounded border border-[#333] bg-white cursor-pointer"></div>
                   <span className="text-xs text-gray-400 font-mono">#FFFFFF</span>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Text Specific Properties */}
        {isText && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Font Family</label>
              <select 
                className="w-full text-sm bg-[#222] border border-[#333] rounded-lg p-2 text-gray-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                value={activeObjectProps.fontFamily || 'Inter'}
                onChange={(e) => updateProp('fontFamily', e.target.value)}
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Lora">Lora</option>
                <option value="Poppins">Poppins</option>
                <option value="Nunito">Nunito</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Oswald">Oswald</option>
                <option value="Raleway">Raleway</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Font Size</label>
                <div className="flex items-center bg-[#222] border border-[#333] rounded-lg focus-within:border-blue-500 transition-colors overflow-hidden">
                  <input 
                    type="number" 
                    className="w-full p-2 text-sm outline-none bg-transparent text-gray-200" 
                    value={activeObjectProps.fontSize ? Math.round(activeObjectProps.fontSize) : 24}
                    onChange={(e) => updateProp('fontSize', parseInt(e.target.value) || 24)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Fill Color</label>
                <div className="flex items-center bg-[#222] border border-[#333] rounded-lg focus-within:border-blue-500 transition-colors overflow-hidden">
                  <input 
                    type="color" 
                    className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer ml-1" 
                    value={activeObjectProps.fill || '#000000'}
                    onChange={(e) => updateProp('fill', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="w-full p-2 text-sm outline-none bg-transparent text-gray-200 uppercase"
                    value={activeObjectProps.fill || '#000000'}
                    onChange={(e) => updateProp('fill', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Alignment</label>
              <div className="flex bg-[#222] border border-[#333] rounded-lg p-1">
                <button 
                  onClick={() => updateProp('textAlign', 'left')}
                  className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${activeObjectProps.textAlign === 'left' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateProp('textAlign', 'center')}
                  className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${activeObjectProps.textAlign === 'center' || !activeObjectProps.textAlign ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateProp('textAlign', 'right')}
                  className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${activeObjectProps.textAlign === 'right' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
               <label className="block text-xs font-semibold text-gray-400 mb-2">Style</label>
               <div className="flex space-x-2">
                  <button 
                    onClick={() => updateProp('fontWeight', activeObjectProps.fontWeight === 'bold' ? 'normal' : 'bold')}
                    className={`p-2 rounded-lg border transition-colors ${activeObjectProps.fontWeight === 'bold' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-[#222] border-[#333] text-gray-500 hover:text-gray-300'}`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => updateProp('fontStyle', activeObjectProps.fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={`p-2 rounded-lg border transition-colors ${activeObjectProps.fontStyle === 'italic' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-[#222] border-[#333] text-gray-500 hover:text-gray-300'}`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => updateProp('underline', !activeObjectProps.underline)}
                    className={`p-2 rounded-lg border transition-colors ${activeObjectProps.underline ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-[#222] border-[#333] text-gray-500 hover:text-gray-300'}`}
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </button>
               </div>
            </div>
            
            <div className="p-3 bg-[#222] border border-[#333] rounded-lg mt-8">
              <div className="flex items-start">
                <TypeIcon className="w-4 h-4 text-gray-500 mt-0.5 mr-2 shrink-0" />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Text expands evenly from the center. Long text will automatically wrap or shrink to fit.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
