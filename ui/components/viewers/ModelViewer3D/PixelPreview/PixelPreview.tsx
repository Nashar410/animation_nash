// ui/components/viewers/ModelViewer3D/PixelPreview/PixelPreview.tsx - Version avec événements passifs
import { useEffect, useRef, useState } from 'react';
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
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Fonction de rendu séparée et optimisée
    const renderFrame = () => {
        if (!canvasRef.current || !frame) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and set background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save context for transformations
        ctx.save();

        // Apply zoom and pan
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.translate(centerX + pan.x, centerY + pan.y);
        ctx.scale(zoom, zoom);
        ctx.translate(-centerX, -centerY);

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

        // Calculate scaled dimensions
        const scaledWidth = frame.processed.width * scale;
        const scaledHeight = frame.processed.height * scale;

        // Center the image
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        // Draw scaled
        ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);

        // Draw grid if enabled and zoom is sufficient
        if (showGrid && scale * zoom > 2) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1 / zoom;

            const startX = x;
            const startY = y;

            // Vertical lines
            for (let i = 0; i <= frame.processed.width; i++) {
                const lineX = startX + i * scale;
                ctx.beginPath();
                ctx.moveTo(lineX, startY);
                ctx.lineTo(lineX, startY + scaledHeight);
                ctx.stroke();
            }

            // Horizontal lines
            for (let i = 0; i <= frame.processed.height; i++) {
                const lineY = startY + i * scale;
                ctx.beginPath();
                ctx.moveTo(startX, lineY);
                ctx.lineTo(startX + scaledWidth, lineY);
                ctx.stroke();
            }
        }

        ctx.restore();
    };

    // Effet optimisé
    useEffect(() => {
        renderFrame();
    }, [frame, scale, showGrid, backgroundColor, zoom, pan]);

    // CORRECTION: Gestion du zoom avec addEventListener pour contrôler passive
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(0.1, Math.min(10, zoom * delta));

            setZoom(newZoom);
        };

        // CORRECTION: Ajouter l'événement avec passive: false
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [zoom]);

    // Gestion du pan avec la souris
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        setPan(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));

        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Reset zoom et pan
    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    if (!frame) {
        return (
            <div className="flex items-center justify-center h-64 w-64 text-gray-500 bg-gray-900 rounded-lg border border-gray-700">
                No preview available
            </div>
        );
    }

    return (
        <div className="relative inline-block">
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="border border-gray-700 cursor-grab active:cursor-grabbing"
                style={{ imageRendering: 'pixelated' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Controls overlay */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded space-y-1">
                <div>{frame.processed.width} × {frame.processed.height}</div>
                <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
            </div>

            {/* Reset button */}
            <button
                onClick={resetView}
                className="absolute top-2 right-2 bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 rounded transition-colors"
                title="Reset view"
            >
                Reset
            </button>

            {/* Instructions */}
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded text-center">
                Scroll to zoom • Drag to pan
            </div>
        </div>
    );
}