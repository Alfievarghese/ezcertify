import React, { useRef, useState, useEffect } from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { useCanvas } from '../../hooks/useCanvas';

export default function CanvasEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canvas, addTextPlaceholder, addQRPlaceholder } = useCanvas(canvasRef, containerRef);
  const [isDragOver, setIsDragOver] = useState(false);

  // Prevent native browser zooming (pinch-to-zoom on trackpads)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    container.addEventListener('wheel', preventDefault, { passive: false });
    
    // Also prevent Safari gesture events
    container.addEventListener('gesturestart', preventDefault, { passive: false });
    container.addEventListener('gesturechange', preventDefault, { passive: false });

    return () => {
      container.removeEventListener('wheel', preventDefault);
      container.removeEventListener('gesturestart', preventDefault);
      container.removeEventListener('gesturechange', preventDefault);
    };
  }, []);

  // Handle drop from sidebar
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!canvas) return;
    
    // Convert DOM coordinates to Fabric logical coordinates (handles zoom & pan)
    const pointer = canvas.getPointer(e.nativeEvent);
    const x = pointer.x;
    const y = pointer.y;

    const columnType = e.dataTransfer.getData('type');
    const columnName = e.dataTransfer.getData('column');

    if (columnType === 'qr') {
      addQRPlaceholder(x, y);
    } else if (columnType === 'text' && columnName) {
      addTextPlaceholder(x, y, columnName);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center transition-colors relative bg-transparent ${
        isDragOver ? 'ring-2 ring-blue-500 ring-inset bg-blue-500/5' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      tabIndex={0}
      style={{
        backgroundImage: 'radial-gradient(#222 1.5px, transparent 0)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* Fabric.js Canvas Wrapper */}
      <div className="absolute inset-0 w-full h-full focus:outline-none" id="canvas-wrapper">
        <canvas ref={canvasRef} className="w-full h-full focus:outline-none" />
      </div>

      {/* Navigation Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-[#1a1a1a]/80 backdrop-blur-md border border-[#333] text-gray-300 text-[11px] font-medium tracking-wide rounded-full shadow-lg flex space-x-6 opacity-60 hover:opacity-100 transition-opacity z-10 select-none">
        <span className="flex items-center"><span className="text-gray-500 mr-2">🔍</span> Cmd + Scroll to Zoom</span>
        <span className="flex items-center"><span className="text-gray-500 mr-2">✋</span> Space + Drag to Pan</span>
        <span className="flex items-center"><span className="text-gray-500 mr-2">⌨️</span> Del to Remove</span>
      </div>
    </div>
  );
}
