// core/pixel-processor/algorithms/PixelArtAlgorithm.ts - Nouvel algorithme professionnel
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelSettings, ColorPalette } from '@shared/types/pixelart';
import { colorDistance } from '@shared/utils/color';

export class PixelArtAlgorithm implements IPixelAlgorithm {
    name = 'pixel-art-pro' as const;

    apply(input: ImageData, settings: PixelSettings): ImageData {
        console.log(`🎨 Professional Pixel Art Processing ${input.width}x${input.height} → ${settings.targetSize.width}x${settings.targetSize.height}`);

        // Étape 1: Pré-traitement de l'image
        let processed = this.preprocessImage(input);

        // Étape 2: Redimensionnement intelligent avec préservation des détails
        processed = this.smartResize(processed, settings.targetSize.width, settings.targetSize.height);

        // Étape 3: Réduction de couleur si palette définie
        if (settings.colorPalette) {
            processed = this.quantizeColors(processed, settings.colorPalette, settings.dithering, settings.ditheringStrength);
        }

        // Étape 4: Post-traitement pour nettoyer les artefacts
        processed = this.postProcess(processed);

        // Étape 5: Ajustements finaux
        if (settings.contrastBoost > 0 || settings.brightnessAdjust !== 0) {
            processed = this.adjustBrightnessContrast(processed, settings.brightnessAdjust, settings.contrastBoost);
        }

        console.log('✅ Pixel art processing complete');
        return processed;
    }

    supportsWorker(): boolean {
        return true;
    }

    // Étape 1: Pré-traitement pour améliorer la qualité
    private preprocessImage(input: ImageData): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(input.data),
            input.width,
            input.height
        );

        // Amélioration du contraste local pour faire ressortir les détails
        this.enhanceLocalContrast(output);

        // Réduction du bruit de fond
        this.reduceNoise(output);

        return output;
    }

    // Amélioration du contraste local (inspiré de CLAHE)
    private enhanceLocalContrast(image: ImageData): void {
        const width = image.width;
        const height = image.height;
        const blockSize = 8; // Taille des blocs pour le traitement local

        for (let by = 0; by < height; by += blockSize) {
            for (let bx = 0; bx < width; bx += blockSize) {
                // Calculer l'histogramme local
                const histogram = new Array(256).fill(0);
                let pixelCount = 0;

                for (let y = by; y < Math.min(by + blockSize, height); y++) {
                    for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                        const idx = (y * width + x) * 4;
                        const brightness = Math.round(
                            0.299 * image.data[idx] +
                            0.587 * image.data[idx + 1] +
                            0.114 * image.data[idx + 2]
                        );
                        histogram[brightness]++;
                        pixelCount++;
                    }
                }

                // Égalisation d'histogramme limitée
                const cdf = new Array(256);
                cdf[0] = histogram[0];
                for (let i = 1; i < 256; i++) {
                    cdf[i] = cdf[i - 1] + histogram[i];
                }

                // Appliquer la transformation
                for (let y = by; y < Math.min(by + blockSize, height); y++) {
                    for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                        const idx = (y * width + x) * 4;

                        for (let c = 0; c < 3; c++) {
                            const value = image.data[idx + c];
                            const enhanced = Math.round((cdf[value] / pixelCount) * 255);
                            // Mélanger avec l'original pour éviter les artefacts
                            image.data[idx + c] = Math.round(value * 0.3 + enhanced * 0.7);
                        }
                    }
                }
            }
        }
    }

    // Réduction du bruit
    private reduceNoise(image: ImageData): void {
        const width = image.width;
        const height = image.height;
        const temp = new Uint8ClampedArray(image.data);

        // Filtre bilatéral simplifié
        const radius = 2;
        const spatialSigma = 2.0;
        const intensitySigma = 50.0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const centerIdx = (y * width + x) * 4;

                let weightSum = 0;
                let r = 0, g = 0, b = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;

                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            const neighborIdx = (ny * width + nx) * 4;

                            // Poids spatial
                            const spatialDist = Math.sqrt(dx * dx + dy * dy);
                            const spatialWeight = Math.exp(-(spatialDist * spatialDist) / (2 * spatialSigma * spatialSigma));

                            // Poids d'intensité
                            const intensityDiff = Math.sqrt(
                                Math.pow(temp[centerIdx] - temp[neighborIdx], 2) +
                                Math.pow(temp[centerIdx + 1] - temp[neighborIdx + 1], 2) +
                                Math.pow(temp[centerIdx + 2] - temp[neighborIdx + 2], 2)
                            );
                            const intensityWeight = Math.exp(-(intensityDiff * intensityDiff) / (2 * intensitySigma * intensitySigma));

                            const weight = spatialWeight * intensityWeight;
                            weightSum += weight;

                            r += temp[neighborIdx] * weight;
                            g += temp[neighborIdx + 1] * weight;
                            b += temp[neighborIdx + 2] * weight;
                        }
                    }
                }

                if (weightSum > 0) {
                    image.data[centerIdx] = Math.round(r / weightSum);
                    image.data[centerIdx + 1] = Math.round(g / weightSum);
                    image.data[centerIdx + 2] = Math.round(b / weightSum);
                }
            }
        }
    }

    // Étape 2: Redimensionnement intelligent
    private smartResize(input: ImageData, targetWidth: number, targetHeight: number): ImageData {
        // Si l'image est plus grande, on utilise une réduction par zones
        if (input.width > targetWidth || input.height > targetHeight) {
            return this.areaResize(input, targetWidth, targetHeight);
        } else {
            // Sinon, on utilise une interpolation bicubique
            return this.bicubicResize(input, targetWidth, targetHeight);
        }
    }

    // Redimensionnement par moyennage de zones
    private areaResize(input: ImageData, targetWidth: number, targetHeight: number): ImageData {
        const output = new ImageData(targetWidth, targetHeight);
        const xRatio = input.width / targetWidth;
        const yRatio = input.height / targetHeight;

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const x1 = x * xRatio;
                const y1 = y * yRatio;
                const x2 = Math.min((x + 1) * xRatio, input.width);
                const y2 = Math.min((y + 1) * yRatio, input.height);

                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;

                // Moyenner tous les pixels dans la zone
                for (let sy = Math.floor(y1); sy < y2; sy++) {
                    for (let sx = Math.floor(x1); sx < x2; sx++) {
                        const weight =
                            (Math.min(sx + 1, x2) - Math.max(sx, x1)) *
                            (Math.min(sy + 1, y2) - Math.max(sy, y1));

                        const idx = (sy * input.width + sx) * 4;
                        r += input.data[idx] * weight;
                        g += input.data[idx + 1] * weight;
                        b += input.data[idx + 2] * weight;
                        a += input.data[idx + 3] * weight;
                        count += weight;
                    }
                }

                const outIdx = (y * targetWidth + x) * 4;
                output.data[outIdx] = Math.round(r / count);
                output.data[outIdx + 1] = Math.round(g / count);
                output.data[outIdx + 2] = Math.round(b / count);
                output.data[outIdx + 3] = Math.round(a / count);
            }
        }

        return output;
    }

    // Interpolation bicubique pour l'agrandissement
    private bicubicResize(input: ImageData, targetWidth: number, targetHeight: number): ImageData {
        const output = new ImageData(targetWidth, targetHeight);
        const xRatio = (input.width - 1) / targetWidth;
        const yRatio = (input.height - 1) / targetHeight;

        // Fonction de poids bicubique
        const cubic = (t: number): number => {
            const a = -0.5;
            t = Math.abs(t);
            if (t <= 1) {
                return (a + 2) * t * t * t - (a + 3) * t * t + 1;
            } else if (t <= 2) {
                return a * t * t * t - 5 * a * t * t + 8 * a * t - 4 * a;
            }
            return 0;
        };

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const sx = x * xRatio;
                const sy = y * yRatio;
                const fx = Math.floor(sx);
                const fy = Math.floor(sy);

                let r = 0, g = 0, b = 0, a = 0;

                // Interpolation 4x4
                for (let m = -1; m <= 2; m++) {
                    for (let n = -1; n <= 2; n++) {
                        const cx = Math.min(Math.max(fx + n, 0), input.width - 1);
                        const cy = Math.min(Math.max(fy + m, 0), input.height - 1);

                        const weight = cubic(sx - (fx + n)) * cubic(sy - (fy + m));
                        const idx = (cy * input.width + cx) * 4;

                        r += input.data[idx] * weight;
                        g += input.data[idx + 1] * weight;
                        b += input.data[idx + 2] * weight;
                        a += input.data[idx + 3] * weight;
                    }
                }

                const outIdx = (y * targetWidth + x) * 4;
                output.data[outIdx] = Math.max(0, Math.min(255, Math.round(r)));
                output.data[outIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
                output.data[outIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
                output.data[outIdx + 3] = Math.max(0, Math.min(255, Math.round(a)));
            }
        }

        return output;
    }

    // Étape 3: Quantification des couleurs avec palette
    private quantizeColors(
        input: ImageData,
        palette: ColorPalette,
        dithering: boolean,
        ditheringStrength: number
    ): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(input.data),
            input.width,
            input.height
        );

        if (dithering) {
            // Utiliser l'algorithme de Bayer pour un dithering ordonné (meilleur pour le pixel art)
            return this.orderedDithering(output, palette, ditheringStrength);
        } else {
            // Quantification simple
            return this.simpleQuantize(output, palette);
        }
    }

    // Quantification simple sans dithering
    private simpleQuantize(image: ImageData, palette: ColorPalette): ImageData {
        for (let i = 0; i < image.data.length; i += 4) {
            const currentColor = {
                r: image.data[i],
                g: image.data[i + 1],
                b: image.data[i + 2],
                a: image.data[i + 3]
            };

            const closestColor = this.findClosestColor(currentColor, palette);

            image.data[i] = closestColor.r;
            image.data[i + 1] = closestColor.g;
            image.data[i + 2] = closestColor.b;
            image.data[i + 3] = closestColor.a;
        }

        return image;
    }

    // Dithering ordonné (matrice de Bayer)
    private orderedDithering(image: ImageData, palette: ColorPalette, strength: number): ImageData {
        // Matrice de Bayer 4x4
        const bayerMatrix = [
            [ 0,  8,  2, 10],
            [12,  4, 14,  6],
            [ 3, 11,  1,  9],
            [15,  7, 13,  5]
        ];

        const matrixSize = 4;
        const factor = strength * 64 / 16; // Normaliser la force

        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const idx = (y * image.width + x) * 4;

                // Récupérer le seuil de la matrice de Bayer
                const threshold = (bayerMatrix[y % matrixSize][x % matrixSize] / 16 - 0.5) * factor;

                // Ajouter le seuil aux couleurs
                const modifiedColor = {
                    r: Math.max(0, Math.min(255, image.data[idx] + threshold)),
                    g: Math.max(0, Math.min(255, image.data[idx + 1] + threshold)),
                    b: Math.max(0, Math.min(255, image.data[idx + 2] + threshold)),
                    a: image.data[idx + 3]
                };

                // Trouver la couleur la plus proche
                const closestColor = this.findClosestColor(modifiedColor, palette);

                image.data[idx] = closestColor.r;
                image.data[idx + 1] = closestColor.g;
                image.data[idx + 2] = closestColor.b;
                image.data[idx + 3] = closestColor.a;
            }
        }

        return image;
    }

    // Trouver la couleur la plus proche dans la palette
    private findClosestColor(color: {r: number, g: number, b: number, a: number}, palette: ColorPalette) {
        let closestColor = palette.colors[0];
        let minDistance = colorDistance(color, closestColor);

        for (let i = 1; i < palette.colors.length; i++) {
            const distance = colorDistance(color, palette.colors[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = palette.colors[i];
            }
        }

        return closestColor;
    }

    // Étape 4: Post-traitement
    private postProcess(image: ImageData): ImageData {
        // Détection et suppression des pixels isolés
        this.removeIsolatedPixels(image);

        // Lissage des contours
        this.smoothEdges(image);

        return image;
    }

    // Supprimer les pixels isolés (anti-artefacts)
    private removeIsolatedPixels(image: ImageData): void {
        const width = image.width;
        const height = image.height;
        const temp = new Uint8ClampedArray(image.data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                // Compter les pixels similaires autour
                let similarCount = 0;
                const centerR = temp[idx];
                const centerG = temp[idx + 1];
                const centerB = temp[idx + 2];

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;

                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        const diff = Math.abs(centerR - temp[nIdx]) +
                            Math.abs(centerG - temp[nIdx + 1]) +
                            Math.abs(centerB - temp[nIdx + 2]);

                        if (diff < 30) { // Seuil de similarité
                            similarCount++;
                        }
                    }
                }

                // Si le pixel est trop différent de ses voisins, le remplacer
                if (similarCount < 2) {
                    // Moyenner avec les voisins
                    let r = 0, g = 0, b = 0, count = 0;

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;

                            const nIdx = ((y + dy) * width + (x + dx)) * 4;
                            r += temp[nIdx];
                            g += temp[nIdx + 1];
                            b += temp[nIdx + 2];
                            count++;
                        }
                    }

                    image.data[idx] = Math.round(r / count);
                    image.data[idx + 1] = Math.round(g / count);
                    image.data[idx + 2] = Math.round(b / count);
                }
            }
        }
    }

    // Lissage des contours
    private smoothEdges(image: ImageData): void {
        const width = image.width;
        const height = image.height;
        const temp = new Uint8ClampedArray(image.data);

        // Détection des contours avec Sobel
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                // Calcul du gradient
                let gx = 0, gy = 0;

                // Sobel X
                gx += temp[((y - 1) * width + (x - 1)) * 4] * -1;
                gx += temp[((y) * width + (x - 1)) * 4] * -2;
                gx += temp[((y + 1) * width + (x - 1)) * 4] * -1;
                gx += temp[((y - 1) * width + (x + 1)) * 4] * 1;
                gx += temp[((y) * width + (x + 1)) * 4] * 2;
                gx += temp[((y + 1) * width + (x + 1)) * 4] * 1;

                // Sobel Y
                gy += temp[((y - 1) * width + (x - 1)) * 4] * -1;
                gy += temp[((y - 1) * width + (x)) * 4] * -2;
                gy += temp[((y - 1) * width + (x + 1)) * 4] * -1;
                gy += temp[((y + 1) * width + (x - 1)) * 4] * 1;
                gy += temp[((y + 1) * width + (x)) * 4] * 2;
                gy += temp[((y + 1) * width + (x + 1)) * 4] * 1;

                const gradient = Math.sqrt(gx * gx + gy * gy);

                // Si c'est un contour, lisser légèrement
                if (gradient > 50) {
                    let r = 0, g = 0, b = 0;
                    const weights = [0.05, 0.1, 0.05, 0.1, 0.4, 0.1, 0.05, 0.1, 0.05];
                    let wIdx = 0;

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nIdx = ((y + dy) * width + (x + dx)) * 4;
                            r += temp[nIdx] * weights[wIdx];
                            g += temp[nIdx + 1] * weights[wIdx];
                            b += temp[nIdx + 2] * weights[wIdx];
                            wIdx++;
                        }
                    }

                    image.data[idx] = Math.round(r);
                    image.data[idx + 1] = Math.round(g);
                    image.data[idx + 2] = Math.round(b);
                }
            }
        }
    }

    // Étape 5: Ajustements finaux
    private adjustBrightnessContrast(input: ImageData, brightness: number, contrast: number): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(input.data),
            input.width,
            input.height
        );

        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < output.data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                let value = output.data[i + j];

                // Appliquer le contraste
                value = contrastFactor * (value - 128) + 128;

                // Appliquer la luminosité
                value += brightness;

                // Clamper
                output.data[i + j] = Math.max(0, Math.min(255, Math.round(value)));
            }
        }

        return output;
    }
}