// ui/hooks/usePixelProcessor.ts
import { useState, useCallback } from 'react';
import { ProcessedFrame, PixelSettings, PixelAlgorithm } from '@shared/types';
import {SimplePixelProcessor} from "@core/pixel-processor/SimplePixelProcessor.ts";
import { AlgorithmFactory } from "@core/pixel-processor/algorithms/AlgorithmFactory";


export function usePixelProcessor(initialAlgorithm: PixelAlgorithm = 'nearest-neighbor') {
    const [processor] = useState(() => {
        const algorithm = AlgorithmFactory.create(initialAlgorithm);
        return new SimplePixelProcessor(algorithm);
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedFrame, setProcessedFrame] = useState<ProcessedFrame | null>(null);

    const processImage = useCallback(async (
        imageData: ImageData,
        settings: PixelSettings
    ) => {
        setIsProcessing(true);
        try {
            const frame = await processor.process(imageData, settings);
            setProcessedFrame(frame);
            return frame;
        } finally {
            setIsProcessing(false);
        }
    }, [processor]);

    const changeAlgorithm = useCallback((algorithmName: PixelAlgorithm) => {
        const algorithm = AlgorithmFactory.create(algorithmName);
        processor.setAlgorithm(algorithm);
    }, [processor]);

    return {
        processImage,
        processedFrame,
        isProcessing,
        changeAlgorithm,
    };
}