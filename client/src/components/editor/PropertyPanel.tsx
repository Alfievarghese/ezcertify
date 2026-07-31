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
      <div className="flex flex-col h-full bg-white">
        <div className="p-5 border-b-4 border-black bg-[#fef08a]">
          <h2 className="text-sm font-black text-black uppercase tracking-tighter">
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-sm font-bold text-black border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Select an element on the canvas to edit its properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b-4 border-black bg-[#fef08a]">
        <h2 className="text-sm font-black text-black uppercase tracking-tighter">
          {isQR ? 'QR Properties' : 'Text Properties'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* QR Specific Properties */}
        {isQR && (
          <div className="space-y-6">
             <div>
               <label className="block text-xs font-black text-black uppercase tracking-tighter mb-2">
                 Bind Verification To
               </label>
               <select 
                 className="w-full text-sm font-bold border-2 border-black bg-white p-2 text-black outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] transition-all cursor-pointer appearance-none rounded-none"
                 value={qrBoundColumn || ''}
                 onChange={(e) => setQrBoundColumn(e.target.value)}
               >
                 <option value="" disabled>Select Excel Column</option>
                 {excelData?.headers.map(h => (
                   <option key={h} value={h}>{h}</option>
                 ))}
               </select>
               <p className="text-[11px] font-bold text-gray-600 mt-3 border-l-2 border-black pl-2">
                 Value shown on verification page when scanned.
               </p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-black text-black uppercase tracking-tighter mb-2">Dark Color</label>
                 <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 rounded-none border-2 border-black bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"></div>
                   <span className="text-xs text-black font-bold font-mono">#000000</span>
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-black text-black uppercase tracking-tighter mb-2">Light Color</label>
                 <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 rounded-none border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"></div>
                   <span className="text-xs text-black font-bold font-mono">#FFFFFF</span>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Text Specific Properties */}
        {isText && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-tighter mb-2">Font Family</label>
              <select 
                className="w-full text-sm font-bold border-2 border-black bg-white p-2 text-black outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] transition-all cursor-pointer appearance-none rounded-none"
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
                <label className="block text-xs font-black text-black uppercase tracking-tighter mb-2">Font Size</label>
                <div className="flex items-center border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-within:translate-y-[2px] focus-within:translate-x-[2px] transition-all rounded-none">
                  <input 
                    type="number" 
                    className="w-full p-2 text-sm font-bold outline-none bg-transparent text-black" 
                    value={activeObjectProps.fontSize ? Math.round(activeObjectProps.fontSize) : 24}
                    onChange={(e) => updateProp('fontSize', parseInt(e.target.value) || 24)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-black uppercase tracking-tighter mb-2">Fill Color</label>
                <div className="flex items-center border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-within:translate-y-[2px] focus-within:translate-x-[2px] transition-all rounded-none">
                  <input 
                    type="color" 
                    className="w-8 h-8 p-0 border-r-2 border-black bg-transparent cursor-pointer ml-1" 
                    value={activeObjectProps.fill || '#000000'}
                    onChange={(e) => updateProp('fill', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="w-full p-2 text-sm font-bold outline-none bg-transparent text-black uppercase"
                    value={activeObjectProps.fill || '#000000'}
                    onChange={(e) => updateProp('fill', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-tighter mb-2">Alignment</label>
              <div className="flex border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white divide-x-2 divide-black">
                <button 
                  onClick={() => updateProp('textAlign', 'left')}
                  className={`flex-1 flex justify-center py-2 transition-colors ${activeObjectProps.textAlign === 'left' ? 'bg-[#bbf7d0] text-black shadow-inner' : 'text-black hover:bg-gray-100'}`}
                >
                  <AlignLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => updateProp('textAlign', 'center')}
                  className={`flex-1 flex justify-center py-2 transition-colors ${activeObjectProps.textAlign === 'center' || !activeObjectProps.textAlign ? 'bg-[#bbf7d0] text-black shadow-inner' : 'text-black hover:bg-gray-100'}`}
                >
                  <AlignCenter className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => updateProp('textAlign', 'right')}
                  className={`flex-1 flex justify-center py-2 transition-colors ${activeObjectProps.textAlign === 'right' ? 'bg-[#bbf7d0] text-black shadow-inner' : 'text-black hover:bg-gray-100'}`}
                >
                  <AlignRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
               <label className="block text-xs font-black text-black uppercase tracking-tighter mb-2">Style</label>
               <div className="flex space-x-3">
                  <button 
                    onClick={() => updateProp('fontWeight', activeObjectProps.fontWeight === 'bold' ? 'normal' : 'bold')}
                    className={`p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all rounded-none ${activeObjectProps.fontWeight === 'bold' ? 'bg-[#bbf7d0] text-black' : 'bg-white text-black'}`}
                  >
                    <Bold className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => updateProp('fontStyle', activeObjectProps.fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={`p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all rounded-none ${activeObjectProps.fontStyle === 'italic' ? 'bg-[#bbf7d0] text-black' : 'bg-white text-black'}`}
                  >
                    <Italic className="w-5 h-5" />
                  </button>
               </div>
            </div>
            
            <div className="p-4 bg-[#fef08a] border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-8">
              <div className="flex items-start">
                <TypeIcon className="w-5 h-5 text-black mt-0.5 mr-3 shrink-0" />
                <p className="text-xs font-bold text-black leading-relaxed">
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
