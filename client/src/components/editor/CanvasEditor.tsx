import React, { useRef, useState, useEffect } from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { useCanvas } from '../../hooks/useCanvas';

export default function CanvasEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addTextPlaceholder, addQRPlaceholder } = useCanvas(canvasRef, containerRef);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle drop from sidebar
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!containerRef.current) return;
    
    // Get drop coordinates relative to container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
      className={`w-full h-full flex items-center justify-center transition-colors relative ${
        isDragOver ? 'bg-primary-50 ring-4 ring-primary-300 ring-inset' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Fabric.js Canvas Wrapper */}
      <div className="shadow-lg relative">
        <canvas ref={canvasRef} />
      </div>
      
      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
           <div className="bg-primary-500/80 text-white px-6 py-3 rounded-full font-medium shadow-lg backdrop-blur-sm animate-scale-in">
             Drop to add placeholder
           </div>
        </div>
      )}

      {/* Navigation Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-surface-900/70 text-white text-xs rounded-full backdrop-blur-md flex space-x-4 opacity-70 hover:opacity-100 transition-opacity z-10">
        <span>🖱️ Scroll to Zoom</span>
        <span>✋ Alt + Drag to Pan</span>
      </div>
    </div>
  );
}
