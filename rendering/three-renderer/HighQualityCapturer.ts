// rendering/three-renderer/HighQualityCapturer.ts
import * as THREE from 'three';

export class HighQualityCapturer {
    public static capture(
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
        renderer: THREE.WebGLRenderer,
        model: THREE.Group,
        width: number,
        height: number
    ): ImageData | null {
        try {
            // Sauvegarder l'état
            const originalState = {
                background: scene.background,
                shadows: renderer.shadowMap.enabled,
                toneMapping: renderer.toneMapping,
                exposure: renderer.toneMappingExposure,
                camPosition: camera.position.clone(),
            };

            // Configurer pour la capture
            scene.background = new THREE.Color(0x000000);
            renderer.shadowMap.enabled = false;
            renderer.toneMapping = THREE.NoToneMapping;

            // Cadrage
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;
            const distance = (maxDim / 2) / Math.tan((fov * Math.PI / 180) / 2) * 1.5;

            if (camera instanceof THREE.PerspectiveCamera) {
                const angle = Math.PI / 4, elevation = Math.PI / 6;
                camera.position.set(
                    center.x + distance * Math.cos(angle) * Math.cos(elevation),
                    center.y + distance * Math.sin(elevation),
                    center.z + distance * Math.sin(angle) * Math.cos(elevation)
                );
                camera.lookAt(center);
            }

            // Éclairage temporaire
            const tempLights = [new THREE.AmbientLight(0xffffff, 0.8), new THREE.DirectionalLight(0xffffff, 0.4)];
            tempLights[1].position.set(5, 10, 5);
            tempLights.forEach(l => scene.add(l));

            // Super-sampling
            const samples = 4;
            const superWidth = width * samples, superHeight = height * samples;
            const renderTarget = new THREE.WebGLRenderTarget(superWidth, superHeight, { format: THREE.RGBAFormat });

            renderer.setRenderTarget(renderTarget);
            renderer.setSize(superWidth, superHeight);
            renderer.render(scene, camera);

            const pixelsHR = new Uint8Array(superWidth * superHeight * 4);
            renderer.readRenderTargetPixels(renderTarget, 0, 0, superWidth, superHeight, pixelsHR);

            // Downsampling
            const imageData = new ImageData(width, height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let r = 0, g = 0, b = 0, a = 0;
                    for (let dy = 0; dy < samples; dy++) {
                        for (let dx = 0; dx < samples; dx++) {
                            const sx = x * samples + dx, sy = y * samples + dy;
                            const si = ((superHeight - 1 - sy) * superWidth + sx) * 4;
                            r += pixelsHR[si]; g += pixelsHR[si + 1]; b += pixelsHR[si + 2]; a += pixelsHR[si + 3];
                        }
                    }
                    const count = samples * samples;
                    const di = (y * width + x) * 4;
                    imageData.data[di] = r / count;
                    imageData.data[di + 1] = g / count;
                    imageData.data[di + 2] = b / count;
                    imageData.data[di + 3] = a / count;
                }
            }

            // Nettoyage et restauration
            renderTarget.dispose();
            tempLights.forEach(l => { scene.remove(l); l.dispose(); });
            renderer.setRenderTarget(null);
            renderer.setSize(width, height);
            scene.background = originalState.background;
            renderer.shadowMap.enabled = originalState.shadows;
            renderer.toneMapping = originalState.toneMapping;
            renderer.toneMappingExposure = originalState.exposure;
            camera.position.copy(originalState.camPosition);

            return imageData;

        } catch (error) {
            console.error('❌ Error capturing frame:', error);
            return null;
        }
    }
}
