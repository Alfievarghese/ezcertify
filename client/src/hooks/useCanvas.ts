import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useEditorContext } from '../context/EditorContext';

export interface Placeholder {
  id: string;
  type: 'text' | 'qr';
  x: number;
  y: number;
  boundColumn?: string;
  
  // Text specific
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number;
  
  // QR specific
  qrSize?: number;
  qrDarkColor?: string;
  qrLightColor?: string;
}

export function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>, containerRef: React.RefObject<HTMLDivElement | null>) {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const { templateData, excelData, setSelectedId, setQrBoundColumn } = useEditorContext();
  const bgImageRef = useRef<fabric.Image | null>(null);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !templateData) return;

    // Make canvas fill the entire container
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Scale image to fit within 80% of the container
    const scale = Math.min(
      (containerWidth * 0.8) / templateData.width,
      (containerHeight * 0.8) / templateData.height
    );

    // Initialize Fabric Canvas
    const fbCanvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: false,
    });

    // Ensure we use the full backend URL for the image since we bypassed the Vercel proxy
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const fullUrl = templateData.url.startsWith('http') ? templateData.url : `${baseUrl}${templateData.url}`;

    // Load background image
    fabric.Image.fromURL(fullUrl).then((img) => {
      img.scale(scale);
      
      // Center the image in the canvas
      const imgWidth = templateData.width * scale;
      const imgHeight = templateData.height * scale;
      
      img.set({
        originX: 'left',
        originY: 'top',
        left: (containerWidth - imgWidth) / 2,
        top: (containerHeight - imgHeight) / 2,
        selectable: false,
        evented: false,
      });
      
      bgImageRef.current = img;
      fbCanvas.add(img);
      fbCanvas.sendObjectToBack(img);
      fbCanvas.renderAll();
    });

    // Event Listeners
    fbCanvas.on('selection:created', (e) => {
      if (e.selected && e.selected.length > 0) {
        setSelectedId((e.selected[0] as any).id || null);
      }
    });

    fbCanvas.on('selection:cleared', () => {
      setSelectedId(null);
    });
    
    fbCanvas.on('selection:updated', (e) => {
      if (e.selected && e.selected.length > 0) {
        setSelectedId((e.selected[0] as any).id || null);
      }
    });

    // Zoom and Pan Implementation
    fbCanvas.on('mouse:wheel', function(opt) {
      const delta = opt.e.deltaY;
      let zoom = fbCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 10) zoom = 10;
      if (zoom < 0.1) zoom = 0.1;
      fbCanvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    fbCanvas.on('mouse:down', function(opt) {
      const evt = opt.e as MouseEvent;
      // Allow panning with Alt key or middle mouse button
      if (evt.altKey === true || evt.button === 1) {
        isDragging = true;
        fbCanvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    fbCanvas.on('mouse:move', function(opt) {
      if (isDragging) {
        const e = opt.e as MouseEvent;
        const vpt = fbCanvas.viewportTransform;
        if (vpt) {
          vpt[4] += e.clientX - lastPosX;
          vpt[5] += e.clientY - lastPosY;
          fbCanvas.requestRenderAll();
        }
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    });

    fbCanvas.on('mouse:up', function(opt) {
      if (isDragging) {
        if (fbCanvas.viewportTransform) {
          fbCanvas.setViewportTransform(fbCanvas.viewportTransform);
        }
        isDragging = false;
        fbCanvas.selection = true;
      }
    });

    setCanvas(fbCanvas);

    // Cleanup
    return () => {
      fbCanvas.dispose();
    };
  }, [templateData]); // Only re-init if template changes

  // Add a text placeholder for a column
  const addTextPlaceholder = (x: number, y: number, column: string) => {
    if (!canvas) return;

    // Get preview text from first row
    const previewText = excelData?.previewRows[0]?.[column] || `[${column}]`;

    const text = new fabric.IText(previewText, {
      left: x,
      top: y,
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#000000',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      transparentCorners: false,
      cornerColor: '#4c6ef5',
      cornerStyle: 'circle',
      borderColor: '#4c6ef5',
      cornerSize: 10,
      padding: 10,
    } as any);
    (text as any).id = `text_${Date.now()}`;
    (text as any).customType = 'placeholder';
    (text as any).boundColumn = column;

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Add QR placeholder
  const addQRPlaceholder = (x: number, y: number) => {
    if (!canvas) return;

    // Create a square rect to represent the QR code
    const qrSize = 100;
    const qrPlaceholder = new fabric.Rect({
      left: x,
      top: y,
      width: qrSize,
      height: qrSize,
      fill: 'rgba(0,0,0,0.1)',
      stroke: '#000000',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      originX: 'center',
      originY: 'center',
      transparentCorners: false,
      cornerColor: '#4c6ef5',
      cornerStyle: 'circle',
      borderColor: '#4c6ef5',
      cornerSize: 10,
    } as any);
    
    // Add QR icon/text inside
    const text = new fabric.Text('QR CODE', {
        left: x,
        top: y,
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#000000',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
    });
    
    const group = new fabric.Group([qrPlaceholder, text], {
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        transparentCorners: false,
        cornerColor: '#4c6ef5',
        cornerStyle: 'circle',
        borderColor: '#4c6ef5',
        cornerSize: 10,
    } as any);
    (group as any).id = `qr_${Date.now()}`;
    (group as any).customType = 'qr';
    (group as any).qrDarkColor = '#000000';
    (group as any).qrLightColor = '#ffffff';

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  // Export layout JSON for the backend
  const exportLayout = (): Placeholder[] => {
    if (!canvas || !templateData) return [];
    
    // We need to calculate scale to get actual pixel coordinates
    // relative to the original template size, or better yet, percentages.
    
    const objects = canvas.getObjects().filter((obj: any) => 
      obj.customType === 'placeholder' || obj.customType === 'qr'
    );
    
    return objects.map((obj: any) => {
      // Calculate coordinates relative to the background image!
      const img = bgImageRef.current;
      if (!img) return null;
      
      const relativeX = obj.left - (img.left || 0);
      const relativeY = obj.top - (img.top || 0);
      
      const scaledImgWidth = (img.width || 0) * (img.scaleX || 1);
      const scaledImgHeight = (img.height || 0) * (img.scaleY || 1);
      
      const xPct = (relativeX / scaledImgWidth) * 100;
      const yPct = (relativeY / scaledImgHeight) * 100;
      
      if (obj.customType === 'qr') {
          // Scale QR size relative to original template
          const scaleX = obj.scaleX || 1;
          const canvasScale = scaledImgWidth / templateData.width;
          const actualSize = (obj.width * scaleX) / canvasScale;
          
          return {
              id: obj.id,
              type: 'qr',
              x: xPct,
              y: yPct,
              qrSize: actualSize,
              qrDarkColor: obj.qrDarkColor || '#000000',
              qrLightColor: obj.qrLightColor || '#ffffff',
          };
      }
      
      return {
        id: obj.id,
        type: 'text',
        x: xPct,
        y: yPct,
        boundColumn: obj.boundColumn,
        fontFamily: obj.fontFamily,
        fontSize: obj.fontSize, 
        fontColor: obj.fill as string,
        fontWeight: obj.fontWeight as string,
        fontStyle: obj.fontStyle as string,
        textAlign: obj.textAlign as 'left' | 'center' | 'right',
      };
    }).filter(Boolean) as Placeholder[];
  };

  return {
    canvas,
    addTextPlaceholder,
    addQRPlaceholder,
    exportLayout,
  };
}
