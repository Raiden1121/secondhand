import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, Move } from 'lucide-react';

const ImageCropper = ({ imageSrc, onCancel, onCropComplete, shape = 'circle', title = '調整頭像' }) => {
    const [zoom, setZoom] = useState(0.5);
    const [minZoom, setMinZoom] = useState(0.1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const imageRef = useRef(null);

    // Initial centering and zoom calculation
    const onImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        const containerSize = 300;

        // Calculate zoom to fit entire image within crop circle
        // Use the larger dimension to ensure entire image is visible
        const scale = containerSize / Math.max(naturalWidth, naturalHeight);

        // Set initial zoom to fit image, but cap at 1.0 to avoid upscaling small images
        const initialZoom = Math.min(scale * 0.9, 1.0); // 0.9 to add small margin
        setZoom(initialZoom);
        setMinZoom(initialZoom); // Store as minimum so user can always return to this
    };

    const handlePointerDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const handleCrop = () => {
        const canvas = document.createElement('canvas');
        const containerSize = 300;
        const exportScale = 4; // Output 1200x1200px image instead of 300x300px
        const exportSize = containerSize * exportScale;

        canvas.width = exportSize;
        canvas.height = exportSize;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, exportSize, exportSize);

        // Clip based on shape
        if (shape === 'circle') {
            ctx.beginPath();
            ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2);
            ctx.clip();
        }

        const img = imageRef.current;

        // Scale transform coordinates by the exportScale
        const centerX = (containerSize / 2 + pan.x) * exportScale;
        const centerY = (containerSize / 2 + pan.y) * exportScale;

        ctx.translate(centerX, centerY);
        ctx.scale(zoom * exportScale, zoom * exportScale);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        canvas.toBlob((blob) => {
            onCropComplete(blob);
        }, 'image/jpeg', 0.95);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">{title}</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    {/* Crop Area */}
                    <div
                        className="relative w-[300px] h-[300px] bg-gray-100 rounded-lg overflow-hidden cursor-move touch-none mb-6 select-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    >
                        {/* Image Layer */}
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                            }}
                        >
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Crop target"
                                className="max-w-none"
                                style={{ maxHeight: 'none', maxWidth: 'none' }}
                                onLoad={onImageLoad}
                            />
                        </div>

                        {/* Mask Layer */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: shape === 'circle'
                                    ? 'radial-gradient(circle, transparent 150px, rgba(0,0,0,0.5) 151px)'
                                    : 'none'
                            }}
                        >
                            {shape === 'square' && (
                                <>
                                    {/* Semi-transparent overlay with square hole */}
                                    <div className="absolute inset-0 bg-black/50" style={{
                                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 10px 10px, 10px calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) 10px, 10px 10px)'
                                    }} />
                                </>
                            )}
                        </div>

                        {/* Border Highlight */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className={`w-[280px] h-[280px] border-2 border-white/50 shadow-sm ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}></div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full space-y-4 px-4">
                        <div className="flex items-center gap-3 text-pine-600">
                            <ZoomOut size={18} />
                            <input
                                type="range"
                                min={minZoom}
                                max="1.0"
                                step="0.005"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 accent-pine-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <ZoomIn size={18} />
                        </div>

                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                            <Move size={12} />
                            拖曳以移動圖片
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleCrop}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                    >
                        <Check size={18} />
                        確認
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
