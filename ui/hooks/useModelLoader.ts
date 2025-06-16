// ui/hooks/useModelLoader.ts
import { useState, useCallback } from 'react';
import { Model3D } from '@shared/types';
import { ModelLoaderFactory } from '@core/model-loader';

export function useModelLoader() {
    const [model, setModel] = useState<Model3D | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadModel = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);

        try {
            const loader = ModelLoaderFactory.create(file.name);
            const loadedModel = await loader.loadModel(file);
            setModel(loadedModel);
        } catch (err) {
            setError(err as Error);
            setModel(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearModel = useCallback(() => {
        setModel(null);
        setError(null);
    }, []);

    return {
        model,
        isLoading,
        error,
        loadModel,
        clearModel,
    };
}