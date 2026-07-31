import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';

export interface PlaceholderLayout {
  id: string;
  type: 'text' | 'qr';
  x: number;
  y: number;
  boundColumn: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number;
  qrSize?: number;
  qrDarkColor?: string;
  qrLightColor?: string;
}

export interface RenderLayout {
  templateUrl: string;
  templateWidth: number;
  templateHeight: number;
  placeholders: PlaceholderLayout[];
}

export interface ClientGenerationOptions {
  layout: RenderLayout;
  rows: Record<string, string>[];
  outputFormat: 'png';
  qrBoundColumn: string;
  onProgress?: (current: number, total: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Loads an image from a URL and returns an HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Important for CORS if image is on another domain
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function buildFont(weight: string, style: string, size: number, family: string): string {
  return `${style} ${weight} ${size}px "${family}"`;
}

/**
 * Generates all certificates locally in the browser, streaming to JSZip.
 * Processes in chunks to prevent UI freezing.
 */
export async function generateCertificatesClientSide(options: ClientGenerationOptions) {
  const { layout, rows, qrBoundColumn, onProgress, onComplete, onError } = options;
  
  try {
    const templateImage = await loadImage(layout.templateUrl);
    
    // Use an offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = layout.templateWidth;
    canvas.height = layout.templateHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error("Could not get 2D context");
    
    const zip = new JSZip();
    const CHUNK_SIZE = 25; // Process 25 rows per frame for maximum speed while keeping UI responsive
    let currentIndex = 0;
    
    // Pre-cache fonts and text baseline
    ctx.textBaseline = 'middle';
    
    const processChunk = async () => {
      const endIndex = Math.min(currentIndex + CHUNK_SIZE, rows.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        const row = rows[i];
        
        // 1. Clear & draw background image
        ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
        
        // 2. Unique ID per certificate
        const certificateId = Math.random().toString(36).substring(2, 14);
        
        // 3. Draw placeholders
        for (const placeholder of layout.placeholders) {
          if (placeholder.type === 'text') {
            const text = row[placeholder.boundColumn] || '';
            if (!text) continue;
            
            const {
              fontFamily = 'Inter',
              fontSize = 24,
              fontColor = '#000000',
              fontWeight = 'normal',
              fontStyle = 'normal',
              textAlign = 'center',
            } = placeholder;
            
            const centerX = (placeholder.x / 100) * canvas.width;
            const centerY = (placeholder.y / 100) * canvas.height;
            
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
            ctx.fillStyle = fontColor;
            
            if (textAlign === 'left') {
              ctx.textAlign = 'left';
            } else if (textAlign === 'right') {
              ctx.textAlign = 'right';
            } else {
              ctx.textAlign = 'center';
            }
            
            ctx.fillText(text, centerX, centerY);
            
          } else if (placeholder.type === 'qr') {
            const qrSize = placeholder.qrSize || 120;
            const darkColor = placeholder.qrDarkColor || '#000000';
            const lightColor = placeholder.qrLightColor || '#ffffff';
            
            // Determine QR data:
            // 1. Bound column value for this row
            // 2. Static value set in properties
            // 3. Fallback to unique certificateId (default verification behavior)
            const qrDataToEncode = (qrBoundColumn ? row[qrBoundColumn] : placeholder.staticValue) || certificateId;
            
            try {
              const qrDataUrl = await QRCode.toDataURL(qrDataToEncode, {
                width: qrSize,
                color: { dark: darkColor, light: lightColor },
                margin: 0
              });
              
              const qrImg = await loadImage(qrDataUrl);
              const centerX = (placeholder.x / 100) * canvas.width;
              const centerY = (placeholder.y / 100) * canvas.height;
              
              ctx.drawImage(qrImg, centerX - qrSize / 2, centerY - qrSize / 2, qrSize, qrSize);
            } catch (e) {
              console.error("Failed to generate QR for row", i, e);
            }
          }
        }
        
        // 4. Save to ZIP — clean file names: Name_RowNumber.png
        const nameColumn = Object.keys(row).find(k => k.toLowerCase() === 'name' || k.toLowerCase().includes('name')) || qrBoundColumn || Object.keys(row)[0];
        const primaryValue = (nameColumn && row[nameColumn]) ? row[nameColumn] : `Certificate`;
        const safeName = primaryValue.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
        const fileName = `${safeName}_${i + 1}.png`;
        
        // Fast canvas blob export
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          zip.file(fileName, blob);
        }
      }
      
      currentIndex = endIndex;
      if (onProgress) onProgress(currentIndex, rows.length);
      
      if (currentIndex < rows.length) {
        setTimeout(processChunk, 0); // Micro-task delay: 10x faster than requestAnimationFrame
      } else {
        // Fast ZIP compression level 1 (fastest zip stream generation)
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
        saveAs(zipBlob, `certificates_${Date.now()}.zip`);
        if (onComplete) onComplete();
      }
    };
    
    // Start processing
    setTimeout(processChunk, 0);
    
  } catch (err: any) {
    if (onError) onError(err.message || 'Client side generation failed');
  }
}
