import { useEffect, useRef } from 'react';

interface Detection {
  id: string;
  type: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
  rawScore: number;
  shadowPenalty: number;
}

interface Props {
  detections: Detection[];
  pingCount: number;
  processed: boolean;
  showShadows: boolean;
}

export const SonarCanvas = ({ detections, pingCount, processed, showShadows }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Create base image data
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    const centerLine = width / 2;

    for (let y = 0; y < height; y++) {
      // Simulate scan line intensity variation
      const scanlineBase = processed ? 120 : (90 + Math.random() * 40);
      
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        // Base noise
        let noise = processed 
          ? (Math.random() * 20 - 10) 
          : (Math.random() * 60 - 30);
          
        // Nadir bright band
        const distToCenter = Math.abs(x - centerLine);
        const nadirFactor = Math.max(0, 1 - distToCenter / (width * 0.15));
        
        let intensity = scanlineBase + noise + (nadirFactor * 60);
        
        // Check if inside a target or shadow
        const px = (x / width) * 100;
        const py = (y / height) * 100;
        
        for (const det of detections) {
          const isTarget = px >= det.x && px <= det.x + det.w && py >= det.y && py <= det.y + det.h;
          
          if (isTarget) {
            intensity += 80; // Bright return
          }
          
          if (showShadows && det.shadowPenalty > 0) {
            // Shadow is on the far-nadir side
            // If target is left of center, shadow is to the left
            // If target is right of center, shadow is to the right
            const isLeft = det.x + det.w/2 < 50;
            const shadowStart = isLeft ? det.x - det.shadowPenalty : det.x + det.w;
            const shadowEnd = isLeft ? det.x : det.x + det.w + det.shadowPenalty;
            
            const isShadow = px >= shadowStart && px <= shadowEnd && py >= det.y && py <= det.y + det.h;
            if (isShadow) {
              intensity -= 100; // Dark shadow
            }
          }
        }
        
        // Clamp
        intensity = Math.max(0, Math.min(255, intensity));
        
        // Add a slight cyan/blue tint to grayscale
        data[i] = intensity * 0.8;     // R
        data[i+1] = intensity * 0.95;  // G
        data[i+2] = intensity;         // B
        data[i+3] = 255;               // Alpha
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Draw bounding boxes over canvas
    detections.forEach(det => {
      const isShadowed = det.shadowPenalty > 0;
      ctx.strokeStyle = isShadowed ? '#fbbf24' : '#00e5ff'; // amber or ice
      ctx.lineWidth = 2;
      ctx.strokeRect((det.x / 100) * width, (det.y / 100) * height, (det.w / 100) * width, (det.h / 100) * height);
      
      // Draw label
      ctx.fillStyle = isShadowed ? '#fbbf24' : '#00e5ff';
      ctx.fillRect((det.x / 100) * width, (det.y / 100) * height - 16, ctx.measureText(det.id).width + 8, 16);
      ctx.fillStyle = '#020b14'; // ocean-950
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(det.id, (det.x / 100) * width + 4, (det.y / 100) * height - 4);
    });
    
  }, [detections, processed, showShadows, pingCount]); // Re-render when pings update

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      role="img"
      aria-label="Side-scan sonar acoustic waterfall visualization canvas"
      className="w-full h-full object-fill rounded shadow-inner"
    >
      Side-scan sonar acoustic waterfall visualization canvas displaying {detections.length} acoustic targets.
    </canvas>
  );
};
