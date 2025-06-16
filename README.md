# 3D to Pixel Art Converter

Transform your 3D models into beautiful pixel art sprites, perfect for retro-style games! This web application provides an intuitive interface to convert GLB/GLTF files into pixel art spritesheets with customizable settings.

![3D to Pixel Art Converter](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)
![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)
![Three.js](https://img.shields.io/badge/Three.js-r158-black.svg)

## ✨ Features

- **3D Model Loading**: Support for GLB and GLTF formats
- **Real-time 3D Preview**: Interactive camera controls with orbit functionality
- **Camera Presets**: Pre-configured views for popular RPG/JRPG styles:
    - Pokémon (45° isometric)
    - Final Fantasy (classic isometric)
    - Chrono Trigger (top-down with angle)
    - Zelda (pure top-down orthographic)
- **Pixel Art Conversion**: Multiple algorithms for different styles
- **Color Palettes**: Retro color schemes (Game Boy, NES, PICO-8)
- **Customizable Output**: Adjust resolution, scaling, and dithering
- **Multiple Export Formats**: PNG, WebP, and JSON metadata
- **Spritesheet Layouts**: Grid, linear, or packed arrangements

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/3d-to-pixelart-converter.git
cd 3d-to-pixelart-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Docker Deployment

```bash
# Build and run with Docker
docker-compose up -d
```

## 📖 Usage Guide

### 1. Load a 3D Model

- Click the upload area or drag & drop a `.glb` or `.gltf` file
- The model will appear in the 3D viewer
- Use mouse to rotate, zoom, and pan the view

### 2. Choose Camera Preset

Select from pre-configured camera angles optimized for different game styles:

- **Pokémon Style**: 45° angle view, perfect for character sprites
- **Final Fantasy Style**: Classic isometric perspective
- **Chrono Trigger Style**: Top-down with slight forward tilt
- **Zelda Style**: Pure top-down orthographic view

### 3. Adjust Pixel Art Settings

- **Target Size**: Resolution of the pixel art (8x8 to 128x128)
- **Pixel Scale**: Size of individual pixels
- **Color Palette**: Choose retro color schemes or full color
- **Dithering**: Add texture to color transitions

### 4. Generate and Export

- Click "Generate Pixel Art" to process the current view
- Preview the result in real-time
- Click "Download Spritesheet" to save your creation

## 🏗️ Architecture

The project follows a modular architecture with SOLID principles:

```
├── shared/          # Shared types and interfaces
├── core/            # Business logic modules
│   ├── model-loader/      # 3D file loading
│   ├── camera-system/     # Camera management
│   ├── pixel-processor/   # Pixel art algorithms
│   ├── spritesheet-generator/ # Layout generation
│   └── exporter/          # File export
├── rendering/       # 3D rendering with Three.js
├── ui/             # React components and hooks
└── workers/        # Web Workers (future)
```

### Key Design Patterns

- **Dependency Injection**: Loose coupling between modules
- **Factory Pattern**: Dynamic creation of loaders, algorithms, and exporters
- **Strategy Pattern**: Interchangeable pixel art algorithms
- **Observer Pattern**: Event-driven communication via EventBus

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### Adding New Features

#### New Camera Preset

```typescript
// core/camera-system/presets/MyPreset.ts
export class MyPreset extends BasePreset {
  constructor() {
    super({
      id: 'my-preset',
      name: 'My Custom Preset',
      camera: {
        position: { x: 10, y: 10, z: 10 },
        // ... camera settings
      },
      // ... other settings
    });
  }
}
```

#### New Pixel Algorithm

```typescript
// core/pixel-processor/algorithms/MyAlgorithm.ts
export class MyAlgorithm implements IPixelAlgorithm {
  name = 'my-algorithm';
  
  apply(input: ImageData, settings: PixelSettings): ImageData {
    // Implementation
  }
}
```

## 🧪 Testing

Run the test suite:

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 🐳 Docker Support

Build and run with Docker:

```bash
docker build -t 3d-to-pixelart .
docker run -p 3000:80 3d-to-pixelart
```

## 📦 Dependencies

### Core Dependencies

- **React 18**: UI framework
- **Three.js**: 3D graphics
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling

### Key Libraries

- `@react-three/fiber`: React renderer for Three.js
- `lucide-react`: Icon library
- `zustand`: State management (optional)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎮 Example Models

You can find free 3D models to test with at:

- [Sketchfab](https://sketchfab.com) - Community 3D models
- [Poly Pizza](https://poly.pizza) - Low poly 3D models
- [Quaternius](https://quaternius.com) - Free game assets
- [OpenGameArt](https://opengameart.org) - Open source game assets

## 🐛 Known Issues

- Large models (>50MB) may cause performance issues
- Some GLTF extensions are not fully supported
- Export to GIF is planned but not yet implemented

## 🚀 Roadmap

- [ ] Animation support with frame selection
- [ ] Batch processing for multiple models
- [ ] Web Workers for better performance
- [ ] More pixel art algorithms (CRT, LCD, etc.)
- [ ] Custom color palette editor
- [ ] Sprite animation preview
- [ ] Command-line interface
- [ ] Plugin system for custom algorithms

## 💬 Support

For questions and support:

- Open an issue on GitHub
- Join our Discord server (coming soon)
- Check the [documentation](docs/) folder

---

Made with ❤️ for game developers and pixel art enthusiasts!