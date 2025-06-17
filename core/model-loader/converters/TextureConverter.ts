// core/model-loader/converters/TextureConverter.ts
import * as THREE from 'three';
import { ModelLoader } from '../ModelLoader';
import { Texture } from '@shared/types';

export class TextureConverter {
    public static extract(threeTexture: THREE.Texture): Texture | null {
        const textureDataUrl = this.toDataURL(threeTexture.image);
        if (!textureDataUrl) return null;

        return {
            id: ModelLoader.generateId('texture'),
            url: textureDataUrl,
            width: threeTexture.image?.width || 512,
            height: threeTexture.image?.height || 512,
        };
    }

    private static toDataURL(image: any): string | null {
        if (!image) return null;
        if (image.src && image.src.startsWith('data:')) {
            return image.src;
        }

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            canvas.width = image.width || 512;
            canvas.height = image.height || 512;

            ctx.drawImage(image, 0, 0);
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Failed to extract texture data:', error);
            return null;
        }
    }
}
