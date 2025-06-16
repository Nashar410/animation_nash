// ui/components/viewers/ModelViewer3D/PixelPreview/PixelPreview.tsx - Zoom définitivement fixé
import { useEffect, useRef, useState, useCallback } from 'react';
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
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Fonction de rendu
    const renderFrame = useCallback(() => {
        if (!canvasRef.current || !frame) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and set background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save context
        ctx.save();

        // Apply zoom and pan around center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.translate(centerX + pan.x, centerY + pan.y);
        ctx.scale(zoom, zoom);
        ctx.translate(-centerX, -centerY);

        // Disable smoothing for pixel art
        ctx.imageSmoothingEnabled = false;

        // Create temp canvas for pixel data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = frame.processed.width;
        tempCanvas.height = frame.processed.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.putImageData(frame.processed, 0, 0);

        // Calculate dimensions
        const scaledWidth = frame.processed.width * scale;
        const scaledHeight = frame.processed.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        // Draw the pixel art
        ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);

        // Draw grid if enabled
        if (showGrid && scale * zoom > 2) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1 / zoom;

            // Vertical grid lines
            for (let i = 0; i <= frame.processed.width; i++) {
                const lineX = x + i * scale;
                ctx.beginPath();
                ctx.moveTo(lineX, y);
                ctx.lineTo(lineX, y + scaledHeight);
                ctx.stroke();
            }

            // Horizontal grid lines
            for (let i = 0; i <= frame.processed.height; i++) {
                const lineY = y + i * scale;
                ctx.beginPath();
                ctx.moveTo(x, lineY);
                ctx.lineTo(x + scaledWidth, lineY);
                ctx.stroke();
            }
        }

        ctx.restore();
    }, [frame, scale, showGrid, backgroundColor, zoom, pan]);

    // Render effect
    useEffect(() => {
        renderFrame();
    }, [renderFrame]);

    // CORRECTION: Wheel handler direct sur le composant
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prevZoom => {
            const newZoom = Math.max(0.1, Math.min(10, prevZoom * delta));
            console.log(`🔍 Zoom: ${(newZoom * 100).toFixed(0)}%`);
            return newZoom;
        });
    }, []);

    // Mouse handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        console.log('🖱️ Start dragging');
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        setPan(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));

        setLastMousePos({ x: e.clientX, y: e.clientY });
    }, [isDragging, lastMousePos]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            console.log('🖱️ Stop dragging');
        }
    }, [isDragging]);

    // Reset view
    const resetView = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        console.log('🔄 View reset');
    }, []);

    // CORRECTION: Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'r' || e.key === 'R') {
                resetView();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [resetView]);

    if (!frame) {
        return (
            <div className="flex items-center justify-center h-64 w-64 text-gray-500 bg-gray-900 rounded-lg border border-gray-700">
                No preview available
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative inline-block select-none"
            style={{
                width: 400,
                height: 400,
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onWheel={handleWheel} // CORRECTION: Directement sur le div
        >
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="border border-gray-700"
                style={{
                    imageRendering: 'pixelated',
                    display: 'block',
                    touchAction: 'none' // Prevent mobile scroll
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Controls overlay */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded space-y-1">
                <div>{frame.processed.width} × {frame.processed.height}</div>
                <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
                <div>Pan: {pan.x.toFixed(0)}, {pan.y.toFixed(0)}</div>
            </div>

            {/* Reset button */}
            <button
                onClick={resetView}
                className="absolute top-2 right-2 bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 rounded transition-colors"
                title="Reset view (R)"
            >
                Reset
            </button>

            {/* Instructions */}
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded text-center">
                Scroll to zoom • Drag to pan • Press R to reset
            </div>

            {/* Debug info in dev mode */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-12 left-2 bg-red-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    DEBUG: Zoom {zoom.toFixed(2)} | Dragging: {isDragging ? 'Yes' : 'No'}
                </div>
            )}
        </div>
    );
}