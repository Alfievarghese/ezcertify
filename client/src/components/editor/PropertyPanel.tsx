import React, { useRef, useState } from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline as UnderlineIcon, Type as TypeIcon, Upload, Trash2, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerOutput,
  ColorPickerEyeDropper,
  ColorPickerFormat
} from '../ui/color-picker';

export default function PropertyPanel() {
  const { 
    selectedId, 
    excelData, 
    qrBoundColumn, 
    setQrBoundColumn,
    activeObjectProps,
    setPropertyUpdateSignal
  } = useEditorContext();

  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const isQR = selectedId?.startsWith('qr_');
  const isText = selectedId?.startsWith('text_');

  const updateProp = (key: string, value: any) => {
    if (setPropertyUpdateSignal) {
      setPropertyUpdateSignal({ key, value, timestamp: Date.now() });
    }
  };

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
      const fontFace = new FontFace(fontName, arrayBuffer);
      await fontFace.load();
      document.fonts.add(fontFace);
      
      setCustomFonts(prev => [...prev, fontName]);
      updateProp('fontFamily', fontName);
      
      if (fontInputRef.current) fontInputRef.current.value = '';
    } catch (err) {
      console.error("Failed to load custom font", err);
      alert("Failed to load the font file.");
    }
  };

  if (!selectedId || !activeObjectProps) {
    return (
      <div className="flex flex-col h-full bg-transparent">
        <div className="p-4 border-b border-[#2a2a2a] shrink-0 bg-[#1a1a1a]">
          <div className="flex items-center space-x-2 text-gray-200">
            <Settings2 className="w-4 h-4" />
            <h2 className="text-sm font-semibold tracking-wide">Properties</h2>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
          <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center mb-4">
            <TypeIcon className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm mb-6">Select an element on the canvas to edit its properties.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('canvas:clear'))}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-400 transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear Canvas
          </button>
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
                 <option value="" className="text-gray-400 italic">None (Use Static Content)</option>
                 {excelData?.headers.map(h => (
                   <option key={h} value={h}>{h}</option>
                 ))}
               </select>
               {qrBoundColumn ? (
                 <p className="text-[11px] text-gray-500 mt-2">
                   Value bound from Excel column for each certificate.
                 </p>
               ) : (
                 <div className="mt-4">
                   <label className="block text-xs font-semibold text-gray-400 mb-2">Static QR Data</label>
                   <input
                     type="text"
                     className="w-full p-2 text-sm bg-[#222] border border-[#333] rounded-lg text-gray-200 outline-none focus:border-blue-500 transition-colors"
                     placeholder="e.g. https://example.com"
                     value={activeObjectProps.staticValue || ''}
                     onChange={(e) => updateProp('staticValue', e.target.value)}
                   />
                   <p className="text-[11px] text-gray-500 mt-2">
                     Same data used for all generated QR codes.
                   </p>
                 </div>
               )}
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
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Source Sans Pro">Source Sans Pro</option>
                <option value="Fira Sans">Fira Sans</option>
                {customFonts.map(font => (
                  <option key={font} value={font}>{font} (Custom)</option>
                ))}
              </select>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] text-gray-500">Need a specific font?</p>
                <button 
                  onClick={() => fontInputRef.current?.click()}
                  className="flex items-center text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload Font File
                </button>
                <input 
                  type="file" 
                  ref={fontInputRef} 
                  onChange={handleCustomFontUpload} 
                  accept=".ttf,.otf,.woff,.woff2" 
                  className="hidden" 
                />
              </div>
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
              
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 mb-2">Fill Color</label>
                <ColorPicker 
                  value={activeObjectProps.fill || '#000000'} 
                  onChange={(color: string) => updateProp('fill', color)}
                  className="w-full rounded-md border border-[#333] bg-[#222] p-3 shadow-sm"
                >
                  <ColorPickerSelection className="mb-2" />
                  <div className="flex items-center gap-3 mb-2">
                    <ColorPickerEyeDropper className="bg-[#111] hover:bg-black border-[#333]" />
                    <div className="w-full grid gap-2">
                      <ColorPickerHue />
                      <ColorPickerAlpha />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ColorPickerOutput className="bg-[#111] border-[#333]" />
                    <ColorPickerFormat className="bg-[#111] border-[#333] flex-1" />
                  </div>
                </ColorPicker>
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
        
        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-[#2a2a2a] space-y-3">
          <label className="block text-xs font-semibold text-gray-400 mb-2">Layer Actions</label>
          <div className="flex space-x-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('canvas:forward'))}
              className="flex-1 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-lg text-xs text-gray-300 transition-colors flex items-center justify-center"
            >
              <ArrowUpToLine className="w-3.5 h-3.5 mr-1.5" />
              Bring Forward
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('canvas:backward'))}
              className="flex-1 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-lg text-xs text-gray-300 transition-colors flex items-center justify-center"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" />
              Send Backward
            </button>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('canvas:delete'))}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-400 transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Element
          </button>
        </div>
      </div>
    </div>
  );
}
