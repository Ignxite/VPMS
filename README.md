# VPMS - A Map to 3D Website

VPMS is an interactive web application that converts any map region into a stunning 3D scene in seconds. Built on OpenStreetMap data, it allows users to select, process, and export high-quality 3D city data in GLB format.

## Features

- **Interactive Map Selection**: Select any region on the map to generate a 3D scene
- **Real-time Processing**: Instantly process map data to create 3D city models
- **Multiple Export Formats**: Export as GLB files or directly to Fleet spaces
- **3D Visualization**: View and manipulate 3D city scenes with intuitive controls
- **Open Source Data**: Utilizes OpenStreetMap for comprehensive geographic data

## Getting Started

### Prerequisites

- Node.js (v18+)
- Bun or npm package manager

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

### Building

```bash
# Build for production
npm run build
# or
bun run build
```

### Preview Production Build

```bash
# Preview the production build
npm run preview
# or
bun run preview
```

## Project Structure

```
src/
├── components/     # React components
├── state/         # State management stores
├── theme/         # Design tokens and theming
├── three/         # Three.js components for 3D rendering
├── ui/            # Main UI application
├── utils/         # Utility functions
├── api/           # API integrations
└── main.tsx       # Application entry point
```

## Technology Stack

- **React 19**: UI framework
- **Three.js**: 3D graphics library
- **React Three Fiber**: React renderer for Three.js
- **Vite**: Build tool
- **TypeScript**: Type-safe development
- **Leaflet**: Map visualization
- **Emotion**: CSS-in-JS styling

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

Visit the [VPMS GitHub repository](https://github.com/Invariants0/VPMS) for more information.
