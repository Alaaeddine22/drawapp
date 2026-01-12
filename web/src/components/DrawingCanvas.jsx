import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = forwardRef(({ paths, onDrawPath, tool, color, brushSize }, ref) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState(null);
    const [currentPath, setCurrentPath] = useState(null);

    useImperativeHandle(ref, () => ({
        clear: () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        },
        getCanvas: () => canvasRef.current
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            redrawPaths();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    useEffect(() => {
        redrawPaths();
    }, [paths]);

    const redrawPaths = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        paths.forEach(path => {
            // Set composite mode for eraser
            if (path.type === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.strokeStyle = path.color || '#6366f1';
            ctx.lineWidth = path.size || 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (path.type === 'line') {
                ctx.beginPath();
                ctx.moveTo(path.start.x, path.start.y);
                ctx.lineTo(path.end.x, path.end.y);
                ctx.stroke();
            } else if (path.type === 'rectangle') {
                ctx.strokeRect(path.start.x, path.start.y, path.end.x - path.start.x, path.end.y - path.start.y);
            } else if (path.type === 'circle') {
                const radius = Math.sqrt(Math.pow(path.end.x - path.start.x, 2) + Math.pow(path.end.y - path.start.y, 2));
                ctx.beginPath();
                ctx.arc(path.start.x, path.start.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (path.type === 'arrow') {
                drawArrow(ctx, path.start.x, path.start.y, path.end.x, path.end.y);
            } else if (path.type === 'eraser' && path.points?.length > 0) {
                // Eraser path - draw with destination-out to erase
                ctx.beginPath();
                ctx.moveTo(path.points[0].x, path.points[0].y);
                path.points.forEach(point => ctx.lineTo(point.x, point.y));
                ctx.stroke();
            } else if (path.points && path.points.length > 0) {
                ctx.beginPath();
                ctx.moveTo(path.points[0].x, path.points[0].y);
                path.points.forEach(point => ctx.lineTo(point.x, point.y));
                ctx.stroke();
            }
        });

        // Reset composite mode
        ctx.globalCompositeOperation = 'source-over';
    };

    const drawArrow = (ctx, fromX, fromY, toX, toY) => {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    };

    const getCoords = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleStart = (e) => {
        e.preventDefault();
        const coords = getCoords(e);
        setIsDrawing(true);
        setStartPos(coords);

        if (tool === 'pen' || tool === 'eraser') {
            setCurrentPath({
                points: [coords],
                type: tool === 'eraser' ? 'eraser' : undefined,
                color: color,
                size: tool === 'eraser' ? brushSize * 3 : brushSize
            });
        }
    };

    const handleMove = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const coords = getCoords(e);

        if (tool === 'pen' || tool === 'eraser') {
            setCurrentPath(prev => ({
                ...prev,
                points: [...(prev?.points || []), coords]
            }));

            // Draw in real-time
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && currentPath?.points.length > 0) {
                const lastPoint = currentPath.points[currentPath.points.length - 1];

                // Set composite mode for eraser
                if (tool === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out';
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                }

                ctx.strokeStyle = currentPath.color;
                ctx.lineWidth = currentPath.size;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(coords.x, coords.y);
                ctx.stroke();

                // Reset composite mode
                ctx.globalCompositeOperation = 'source-over';
            }
        } else {
            // Preview shape
            redrawPaths();
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && startPos) {
                ctx.strokeStyle = color;
                ctx.lineWidth = brushSize;
                ctx.lineCap = 'round';

                if (tool === 'line') {
                    ctx.beginPath();
                    ctx.moveTo(startPos.x, startPos.y);
                    ctx.lineTo(coords.x, coords.y);
                    ctx.stroke();
                } else if (tool === 'rectangle') {
                    ctx.strokeRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
                } else if (tool === 'circle') {
                    const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
                    ctx.beginPath();
                    ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (tool === 'arrow') {
                    drawArrow(ctx, startPos.x, startPos.y, coords.x, coords.y);
                }
            }
        }
    };

    const handleEnd = (e) => {
        if (!isDrawing) return;

        const coords = e.changedTouches ?
            {
                x: e.changedTouches[0].clientX - canvasRef.current.getBoundingClientRect().left,
                y: e.changedTouches[0].clientY - canvasRef.current.getBoundingClientRect().top
            } :
            getCoords(e);

        if (tool === 'pen' || tool === 'eraser') {
            if (currentPath && currentPath.points.length > 1) {
                onDrawPath(currentPath);
            }
        } else if (startPos) {
            onDrawPath({
                type: tool,
                start: startPos,
                end: coords,
                color: color,
                size: brushSize
            });
        }

        setIsDrawing(false);
        setStartPos(null);
        setCurrentPath(null);
    };

    return (
        <div className="drawing-canvas-container">
            <canvas
                ref={canvasRef}
                className="drawing-canvas"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            />
        </div>
    );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
