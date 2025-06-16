
// core/model-loader/ModelLoaderFactory.ts
import { IModelLoader } from '@shared/interfaces';
import { GLBLoader } from './GLBLoader';
// import { FBXLoader } from './FBXLoader'; // Future implementation

export class ModelLoaderFactory {
    static create(format: string): IModelLoader {
        const lowerFormat = format.toLowerCase();

        if (lowerFormat.endsWith('.glb') || lowerFormat.endsWith('.gltf')) {
            return new GLBLoader();
        }

        // Add more loaders here as they're implemented
        // if (lowerFormat.endsWith('.fbx')) {
        //   return new FBXLoader();
        // }

        throw new Error(`Unsupported format: ${format}`);
    }

    static getSupportedFormats(): string[] {
        return ['.glb', '.gltf']; // Add more as implemented
    }
}
