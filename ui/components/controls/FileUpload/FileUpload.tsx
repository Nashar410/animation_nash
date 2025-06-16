// ui/components/controls/FileUpload/FileUpload.tsx - Version améliorée
import React, { useCallback, useState } from 'react';
import { Upload, FileIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
    accept: string;
    onFileSelect: (file: File) => void;
    maxSize?: number; // in MB
}

export function FileUpload({ accept, onFileSelect, maxSize = 50 }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);
        setSuccess(null);

        // Check file size
        if (maxSize && file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Check file type
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!acceptedTypes.some(type => fileExtension === type)) {
            setError(`File type not supported. Accepted types: ${accept}`);
            return;
        }

        setSuccess(`Successfully loaded: ${file.name}`);
        onFileSelect(file);
    }, [accept, maxSize, onFileSelect]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // Only set dragging to false if we're leaving the component entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    return (
        <div className="w-full">
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                    isDragging
                        ? 'border-purple-400 bg-purple-500/10 scale-105'
                        : error
                            ? 'border-red-400/50 bg-red-500/5 hover:border-red-400'
                            : success
                                ? 'border-green-400/50 bg-green-500/5 hover:border-green-400'
                                : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-4">
                    {/* Icon */}
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isDragging
                            ? 'bg-purple-500/20 text-purple-300 scale-110'
                            : error
                                ? 'bg-red-500/20 text-red-300'
                                : success
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                    }`}>
                        {error ? (
                            <AlertCircle className="w-8 h-8" />
                        ) : success ? (
                            <CheckCircle className="w-8 h-8" />
                        ) : isDragging ? (
                            <FileIcon className="w-8 h-8" />
                        ) : (
                            <Upload className="w-8 h-8" />
                        )}
                    </div>

                    {/* Text */}
                    <div>
                        <p className={`text-lg font-semibold mb-2 transition-colors ${
                            isDragging
                                ? 'text-purple-200'
                                : error
                                    ? 'text-red-200'
                                    : success
                                        ? 'text-green-200'
                                        : 'text-white'
                        }`}>
                            {isDragging
                                ? 'Drop your 3D model here!'
                                : error
                                    ? 'Upload failed'
                                    : success
                                        ? 'Model ready!'
                                        : 'Drop your 3D model here'
                            }
                        </p>

                        <p className="text-sm text-white/60 mb-4">
                            or click to browse files
                        </p>

                        {/* File format info */}
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                            <FileIcon className="w-3 h-3" />
                            <span>Supports: {accept} • Max: {maxSize}MB</span>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-300/30 rounded-xl text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 p-3 bg-green-500/20 border border-green-300/30 rounded-xl text-green-200 text-sm">
                            {success}
                        </div>
                    )}
                </div>

                {/* Drag overlay effect */}
                {isDragging && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl pointer-events-none" />
                )}
            </div>

            {/* Format examples */}
            <div className="mt-4 text-center">
                <p className="text-xs text-white/50 mb-2">
                    Popular free 3D model sources:
                </p>
                <div className="flex justify-center space-x-4 text-xs">
                    <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer"
                       className="text-purple-300 hover:text-purple-200 transition-colors">
                        Sketchfab
                    </a>
                    <a href="https://poly.pizza" target="_blank" rel="noopener noreferrer"
                       className="text-purple-300 hover:text-purple-200 transition-colors">
                        Poly Pizza
                    </a>
                    <a href="https://quaternius.com" target="_blank" rel="noopener noreferrer"
                       className="text-purple-300 hover:text-purple-200 transition-colors">
                        Quaternius
                    </a>
                </div>
            </div>
        </div>
    );
}