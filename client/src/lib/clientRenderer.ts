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
    const CHUNK_SIZE = 5; // Process 5 rows before yielding to event loop
    let currentIndex = 0;
    
    const processChunk = async () => {
      const endIndex = Math.min(currentIndex + CHUNK_SIZE, rows.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        const row = rows[i];
        
        // 1. Draw template
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
        
        // 2. Generate unique certificate ID (URL safe)
        const certificateId = Math.random().toString(36).substring(2, 14);
        
        // 3. Draw placeholders
        for (const placeholder of layout.placeholders) {
          if (placeholder.type === 'text') {
            const text = row[placeholder.boundColumn] || '';
            if (!text) continue;
            
            const {
              fontFamily = 'Arial',
              fontSize: baseFontSize = 24,
              fontColor = '#000000',
              fontWeight = 'normal',
              fontStyle = 'normal',
              textAlign = 'center',
            } = placeholder;
            
            const centerX = (placeholder.x / 100) * canvas.width;
            const centerY = (placeholder.y / 100) * canvas.height;
            
            let fontSize = baseFontSize;
            ctx.font = buildFont(fontWeight, fontStyle, fontSize, fontFamily);
            ctx.fillStyle = fontColor;
            ctx.textBaseline = 'middle';
            
            const measured = ctx.measureText(text);
            let textX = centerX;
            
            if (textAlign === 'left') {
              ctx.textAlign = 'left';
              textX = centerX - (measured.width / 2);
            } else if (textAlign === 'right') {
              ctx.textAlign = 'right';
              textX = centerX + (measured.width / 2);
            } else {
              ctx.textAlign = 'center';
              textX = centerX;
            }
            
            ctx.fillText(text, textX, centerY);
            
          } else if (placeholder.type === 'qr') {
            const qrSize = placeholder.qrSize || 120;
            const darkColor = placeholder.qrDarkColor || '#000000';
            const lightColor = placeholder.qrLightColor || '#ffffff';
            
            try {
              const qrDataUrl = await QRCode.toDataURL(certificateId, {
                width: qrSize,
                color: {
                  dark: darkColor,
                  light: lightColor
                },
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
        
        // 4. Save to zip
        const primaryValue = qrBoundColumn ? (row[qrBoundColumn] || 'Certificate') : 'Certificate';
        const safeName = primaryValue.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
        const fileName = `${safeName}_${certificateId}.png`;
        
        // Convert canvas to blob
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          zip.file(fileName, blob);
        }
      }
      
      currentIndex = endIndex;
      if (onProgress) onProgress(currentIndex, rows.length);
      
      if (currentIndex < rows.length) {
        // Yield to event loop to keep UI responsive
        requestAnimationFrame(processChunk);
      } else {
        // All rows done, generate zip
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `certificates_${Date.now()}.zip`);
        if (onComplete) onComplete();
      }
    };
    
    // Start processing
    requestAnimationFrame(processChunk);
    
  } catch (err: any) {
    if (onError) onError(err.message || 'Client side generation failed');
  }
}
