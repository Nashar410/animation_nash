# Cahier des charges : 3D to Pixel Art Spritesheet Converter
*Version 2.0 - Architecture Modulaire*

## Vue d'ensemble
Application web locale permettant de convertir des modèles 3D en spritesheets pixel art optimisées pour les RPG/JRPG, avec un focus initial sur les personnages.

## Objectifs principaux
- Conversion automatique de modèles 3D (avec animations) en spritesheets pixel art
- Interface intuitive avec preview temps réel
- Optimisation spécifique pour le style RPG/JRPG (vue 3/4, isométrique)
- Facilité de déploiement et d'utilisation
- **Architecture modulaire permettant le développement incrémental avec IA**

## Architecture Modulaire

### Principes SOLID appliqués
- **Single Responsibility** : Chaque module a une responsabilité unique et claire
- **Open/Closed** : Extensible via interfaces, fermé aux modifications
- **Liskov Substitution** : Implémentations interchangeables via interfaces
- **Interface Segregation** : Interfaces spécifiques et minimales
- **Dependency Inversion** : Dépendances sur abstractions, pas implémentations

### Structure des modules

```typescript
project/
├── docker-compose.yml
├── shared/
│   ├── types/                    # Types TypeScript partagés
│   │   ├── models.ts            # Types pour les modèles 3D
│   │   ├── rendering.ts         # Types pour le rendu
│   │   ├── pixelart.ts          # Types pour la conversion
│   │   └── export.ts            # Types pour l'export
│   └── interfaces/              # Interfaces pour découplage
│       ├── IModelLoader.ts
│       ├── IRenderer.ts
│       ├── IPixelProcessor.ts
│       └── IExporter.ts
│
├── core/                        # Logique métier pure
│   ├── model-loader/
│   │   ├── ModelLoader.ts       # Classe abstraite
│   │   ├── GLBLoader.ts         # Implémentation GLB
│   │   ├── FBXLoader.ts         # Implémentation FBX
│   │   └── __tests__/
│   │
│   ├── camera-system/
│   │   ├── CameraManager.ts
│   │   ├── presets/
│   │   │   ├── PokemonPreset.ts
│   │   │   ├── FFPreset.ts
│   │   │   └── IPreset.ts
│   │   └── __tests__/
│   │
│   ├── pixel-processor/
│   │   ├── PixelProcessor.ts    # Classe abstraite
│   │   ├── algorithms/
│   │   │   ├── NearestNeighbor.ts
│   │   │   ├── BilinearPixel.ts
│   │   │   └── IAlgorithm.ts
│   │   └── __tests__/
│   │
│   └── spritesheet-generator/
│       ├── SpritesheetGenerator.ts
│       ├── layouts/
│       │   ├── GridLayout.ts
│       │   ├── LinearLayout.ts
│       │   └── ILayout.ts
│       └── __tests__/
│
├── rendering/                   # Moteur de rendu
│   ├── three-renderer/
│   │   ├── ThreeRenderer.ts
│   │   ├── SceneManager.ts
│   │   └── AnimationController.ts
│   │
│   └── canvas-renderer/
│       ├── CanvasRenderer.ts
│       └── PixelCanvas.ts
│
├── ui/                         # Interface utilisateur
│   ├── components/
│   │   ├── viewers/
│   │   │   ├── ModelViewer3D/
│   │   │   │   ├── ModelViewer3D.tsx
│   │   │   │   ├── ModelViewer3D.types.ts
│   │   │   │   └── ModelViewer3D.test.tsx
│   │   │   └── PixelPreview/
│   │   │       ├── PixelPreview.tsx
│   │   │       ├── PixelPreview.types.ts
│   │   │       └── PixelPreview.test.tsx
│   │   │
│   │   ├── controls/
│   │   │   ├── CameraControls/
│   │   │   ├── RenderSettings/
│   │   │   └── ExportOptions/
│   │   │
│   │   └── shared/
│   │       ├── Button/
│   │       ├── Slider/
│   │       └── Dropdown/
│   │
│   ├── hooks/                  # React hooks custom
│   │   ├── useModelLoader.ts
│   │   ├── usePixelProcessor.ts
│   │   └── useExporter.ts
│   │
│   └── contexts/              # Contextes React
│       ├── AppContext.tsx
│       └── RenderContext.tsx
│
├── workers/                    # Web Workers
│   ├── pixel-worker/
│   │   ├── pixel.worker.ts
│   │   └── pixel.worker.types.ts
│   │
│   └── render-worker/
│       ├── render.worker.ts
│       └── render.worker.types.ts
│
└── docker/
    ├── Dockerfile
    └── nginx.conf
```

## Interfaces principales

### IModelLoader
```typescript
interface IModelLoader {
  loadModel(file: File): Promise<Model3D>;
  getSupportedFormats(): string[];
  validateModel(model: Model3D): ValidationResult;
}

interface Model3D {
  id: string;
  meshes: Mesh[];
  animations: Animation[];
  bounds: BoundingBox;
  metadata: ModelMetadata;
}
```

### IRenderer
```typescript
interface IRenderer {
  initialize(canvas: HTMLCanvasElement): void;
  render(model: Model3D, camera: Camera): RenderResult;
  dispose(): void;
}

interface RenderResult {
  image: ImageData;
  renderTime: number;
  frameNumber: number;
}
```

### IPixelProcessor
```typescript
interface IPixelProcessor {
  process(input: ImageData, settings: PixelSettings): ProcessedFrame;
  getAlgorithm(): PixelAlgorithm;
  setAlgorithm(algorithm: PixelAlgorithm): void;
}

interface PixelSettings {
  targetSize: Size;
  pixelScale: number;
  colorPalette?: ColorPalette;
  dithering: boolean;
}
```

### IExporter
```typescript
interface IExporter {
  export(frames: ProcessedFrame[], layout: Layout): ExportResult;
  getSupportedFormats(): ExportFormat[];
  validateExport(data: ExportData): ValidationResult;
}
```

## Spécifications fonctionnelles détaillées

### 1. Import de fichiers (Module: ModelLoader)
- **Formats supportés** : GLB/GLTF (prioritaire), FBX, OBJ
- **Validation** : Vérification structure, animations, taille
- **Normalisation** : Conversion en format interne unifié

### 2. Mode Personnage (Module: CameraSystem + Presets)
- **Préréglages encapsulés** dans des classes séparées
- **Factory pattern** pour la création de presets
- **Configuration externalisée** en JSON

### 3. Pipeline de traitement (Orchestration)

```typescript
class RenderPipeline {
  constructor(
    private modelLoader: IModelLoader,
    private renderer: IRenderer,
    private pixelProcessor: IPixelProcessor,
    private exporter: IExporter
  ) {}

  async process(file: File, settings: PipelineSettings): Promise<ExportResult> {
    // Chaque étape est indépendante et testable
    const model = await this.modelLoader.loadModel(file);
    const frames = await this.renderAllFrames(model, settings);
    const processed = await this.processFrames(frames, settings);
    return await this.exporter.export(processed, settings.layout);
  }
}
```

## Patterns de conception utilisés

### 1. Factory Pattern
```typescript
class PresetFactory {
  private presets: Map<string, IPreset> = new Map();
  
  register(name: string, preset: IPreset): void {
    this.presets.set(name, preset);
  }
  
  create(name: string): IPreset {
    const PresetClass = this.presets.get(name);
    if (!PresetClass) throw new Error(`Unknown preset: ${name}`);
    return new PresetClass();
  }
}
```

### 2. Strategy Pattern (Algorithmes)
```typescript
class PixelProcessor implements IPixelProcessor {
  private algorithm: IPixelAlgorithm;
  
  setAlgorithm(algorithm: IPixelAlgorithm): void {
    this.algorithm = algorithm;
  }
  
  process(input: ImageData, settings: PixelSettings): ProcessedFrame {
    return this.algorithm.apply(input, settings);
  }
}
```

### 3. Observer Pattern (UI Updates)
```typescript
class RenderState extends EventEmitter {
  private state: AppState;
  
  updateState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.emit('stateChanged', this.state);
  }
}
```

## Communication entre modules

### Event Bus
```typescript
// shared/events/EventBus.ts
class EventBus {
  private events: Map<string, Set<Handler>> = new Map();
  
  on(event: string, handler: Handler): void;
  off(event: string, handler: Handler): void;
  emit(event: string, data?: any): void;
}
```

### Dependency Injection Container
```typescript
// shared/di/Container.ts
class DIContainer {
  register<T>(token: Symbol, factory: () => T): void;
  resolve<T>(token: Symbol): T;
}

// Usage
const container = new DIContainer();
container.register(MODEL_LOADER, () => new GLBLoader());
container.register(RENDERER, () => new ThreeRenderer());
```

## Tests et documentation

### Structure des tests
```typescript
// Chaque module a ses tests unitaires
describe('PixelProcessor', () => {
  let processor: PixelProcessor;
  let mockAlgorithm: jest.Mocked<IPixelAlgorithm>;
  
  beforeEach(() => {
    mockAlgorithm = createMockAlgorithm();
    processor = new PixelProcessor(mockAlgorithm);
  });
  
  it('should process image with given settings', async () => {
    // Test isolé sans dépendances externes
  });
});
```

### Documentation des modules
```typescript
/**
 * @module ModelLoader
 * @description Charge et valide les modèles 3D
 * 
 * @example
 * ```typescript
 * const loader = new GLBLoader();
 * const model = await loader.loadModel(file);
 * ```
 * 
 * @dependencies
 * - three.js pour le parsing GLB
 * - ModelValidator pour la validation
 * 
 * @exports
 * - IModelLoader (interface)
 * - GLBLoader (implementation)
 * - Model3D (type)
 */
```

## Avantages de cette architecture

### Pour le développement avec IA
1. **Modules indépendants** : Chaque module peut être développé/modifié séparément
2. **Interfaces claires** : L'IA comprend facilement les contrats
3. **Types stricts** : Évite les erreurs d'intégration
4. **Tests isolés** : Validation module par module

### Pour la maintenance
1. **Ajout de features** : Nouveaux algorithmes/formats sans toucher au reste
2. **Debugging facile** : Problèmes isolés dans leur module
3. **Performance** : Optimisation ciblée par module
4. **Réutilisabilité** : Modules utilisables dans d'autres projets

### Exemple de workflow de développement
```bash
# Développer un module
"Crée le module ModelLoader avec support GLB"
→ IA génère ModelLoader + tests

# Ajouter une feature
"Ajoute le support FBX au ModelLoader"
→ IA étend sans casser l'existant

# Intégrer un module
"Connecte ModelLoader au RenderPipeline"
→ IA utilise les interfaces définies
```

Cette architecture garantit que chaque partie de l'application peut être développée, testée et maintenue indépendamment, facilitant grandement le travail collaboratif avec l'IA.
