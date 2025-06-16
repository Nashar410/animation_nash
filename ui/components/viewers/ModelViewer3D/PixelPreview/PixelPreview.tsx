// ui/components/viewers/PixelPreview/PixelPreview.tsx
import { useEffect, useRef } from 'react';
import { ProcessedFrame } from '@shared/types';

interface PixelPreviewProps {
    frame: ProcessedFrame | null;
    scale?: number;
    showGrid?: boolean;
    backgroundColor?: string;
}

export function PixelPreview({
                                 frame,
                                 scale = 4,
                                 showGrid = false,
                                 backgroundColor = '#1a1a1a',
                             }: PixelPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !frame) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = frame.processed.width * scale;
        canvas.height = frame.processed.height * scale;

        // Clear background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Disable smoothing for pixel art
        ctx.imageSmoothingEnabled = false;

        // Create temporary canvas for pixel data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = frame.processed.width;
        tempCanvas.height = frame.processed.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        // Put image data
        tempCtx.putImageData(frame.processed, 0, 0);

        // Draw scaled
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

        // Draw grid if enabled
        if (showGrid && scale > 2) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;

            // Vertical lines
            for (let x = 0; x <= frame.processed.width; x++) {
                ctx.beginPath();
                ctx.moveTo(x * scale, 0);
                ctx.lineTo(x * scale, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y <= frame.processed.height; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * scale);
                ctx.lineTo(canvas.width, y * scale);
                ctx.stroke();
            }
        }
    }, [frame, scale, showGrid, backgroundColor]);

    if (!frame) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No preview available
            </div>
        );
    }

    return (
        <div className="relative inline-block">
            <canvas
                ref={canvasRef}
                className="image-rendering-pixelated border border-gray-700"
                style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                {frame.processed.width} × {frame.processed.height}
            </div>
        </div>
    );
}