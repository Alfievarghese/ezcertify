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
  const { templateData, excelData, setSelectedId, setActiveObjectProps, propertyUpdateSignal } = useEditorContext();
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
        selectable: true,
        evented: true,
        lockRotation: true,
      });
      
      bgImageRef.current = img;
      fbCanvas.add(img);
      fbCanvas.sendObjectToBack(img);
      fbCanvas.renderAll();
    });

    // Better selection styling
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#4c6ef5',
      cornerStrokeColor: '#ffffff',
      cornerSize: 8,
      padding: 8,
      borderColor: '#4c6ef5',
      borderDashArray: [4, 4],
    });

    // Event Listeners
    const syncActiveObject = (e: any) => {
      if (e.selected && e.selected.length > 0) {
        const obj = e.selected[0] as any;
        setSelectedId(obj.id || null);
        setActiveObjectProps({
          type: obj.customType,
          fontFamily: obj.fontFamily,
          fontSize: obj.fontSize,
          fill: obj.fill,
          textAlign: obj.textAlign,
          fontWeight: obj.fontWeight,
          fontStyle: obj.fontStyle,
          underline: obj.underline,
          boundColumn: obj.boundColumn,
          angle: obj.angle,
        });
      }
    };

    fbCanvas.on('selection:created', syncActiveObject);
    fbCanvas.on('selection:updated', syncActiveObject);

    fbCanvas.on('selection:cleared', () => {
      setSelectedId(null);
      setActiveObjectProps(null);
    });

    // Zoom and Pan Implementation (Figma Style)
    // Disable drag-to-select on empty canvas area — only click on objects to select
    fbCanvas.selection = false;
    
    const handleWheel = (opt: any) => {
      const e = opt.e as WheelEvent;
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom toward pointer
        const delta = e.deltaY;
        let zoom = fbCanvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;
        fbCanvas.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), zoom);
      } else if (e.shiftKey) {
        // Horizontal Pan
        const vpt = fbCanvas.viewportTransform;
        if (vpt) {
          vpt[4] -= e.deltaY;
          fbCanvas.requestRenderAll();
        }
      } else {
        // Vertical Pan
        const vpt = fbCanvas.viewportTransform;
        if (vpt) {
          vpt[4] -= e.deltaX;
          vpt[5] -= e.deltaY;
          fbCanvas.requestRenderAll();
        }
      }
      e.preventDefault();
      e.stopPropagation();
    };
    
    fbCanvas.on('mouse:wheel', handleWheel);

    // Prevent browser native zoom on container
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    
    if (containerRef.current) {
      containerRef.current.addEventListener('wheel', handleNativeWheel, { passive: false });
    }

    let isDragging = false;
    let isSpaceDown = false;
    let lastPosX = 0;
    let lastPosY = 0;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === 'Alt') && e.target !== document.body && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
         if (e.code === 'Space') isSpaceDown = true;
         if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
         
         // Disable object events so we don't accidentally select/move them while panning
         fbCanvas.getObjects().forEach(obj => obj.set('evented', false));
         fbCanvas.discardActiveObject();
         fbCanvas.requestRenderAll();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Alt') {
         if (e.code === 'Space') isSpaceDown = false;
         isDragging = false;
         if (canvasRef.current) canvasRef.current.style.cursor = 'default';
         
         // Re-enable object events
         fbCanvas.getObjects().forEach(obj => obj.set('evented', true));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    fbCanvas.on('mouse:down', function(opt) {
      const evt = opt.e as MouseEvent;
      // Allow panning with Spacebar, Alt key, or middle mouse button
      if (isSpaceDown || evt.altKey === true || evt.button === 1) {
        isDragging = true;
        fbCanvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
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
        if (canvasRef.current && isSpaceDown) {
           canvasRef.current.style.cursor = 'grab';
        } else if (canvasRef.current) {
           canvasRef.current.style.cursor = 'default';
        }
      }
    });

    setCanvas(fbCanvas);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', handleNativeWheel);
      }
      fbCanvas.dispose();
    };
  }, [templateData]); // Only re-init if template changes

  // Listen for property update signals from the context
  useEffect(() => {
    if (!canvas || !propertyUpdateSignal) return;
    
    const activeObject = canvas.getActiveObject() as any;
    if (!activeObject) return;

    if (propertyUpdateSignal.key === 'fontSize') {
       // Reset scaling so fontSize displays correctly
       activeObject.set({ scaleX: 1, scaleY: 1 });
    }
    
    // Convert angle to number if needed
    let val = propertyUpdateSignal.value;
    if (propertyUpdateSignal.key === 'angle') val = parseFloat(val) || 0;
    
    activeObject.set(propertyUpdateSignal.key, val);
    
    setActiveObjectProps((prev: any) => ({
      ...prev,
      [propertyUpdateSignal.key]: propertyUpdateSignal.value
    }));
    
    canvas.requestRenderAll();
  }, [propertyUpdateSignal, canvas, setActiveObjectProps]);

  // Keyboard shortcuts (Delete)
  useEffect(() => {
    if (!canvas) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return; // Don't delete if typing in inputs
      }
      
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach(obj => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          setSelectedId(null);
          setActiveObjectProps(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas, setSelectedId, setActiveObjectProps]);

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
        underline: obj.underline as boolean,
        textAlign: obj.textAlign as 'left' | 'center' | 'right',
        angle: obj.angle || 0,
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
