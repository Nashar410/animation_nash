
// ui/components/controls/FileUpload/FileUpload.tsx
import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
    accept: string;
    onFileSelect: (file: File) => void;
    maxSize?: number; // in MB
}

export function FileUpload({ accept, onFileSelect, maxSize = 50 }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);

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

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                    ? 'border-purple-500 bg-purple-500 bg-opacity-10'
                    : 'border-gray-600 hover:border-gray-500'
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

            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

            <p className="text-lg mb-2">
                Drop your 3D model here or click to browse
            </p>

            <p className="text-sm text-gray-500">
                Supported formats: {accept}
            </p>

            {error && (
                <p className="mt-4 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}