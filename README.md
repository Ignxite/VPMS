# VPMS — 3D Vertical Property Mapping System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)](https://www.typescriptlang.org/)

A web-based 3D geospatial visualization prototype that explores the representation of property in three dimensions. VPMS provides a foundation for 3D cadastral mapping, vertical property identification, and ULPIN-based property management in modern built environments.

## 🎯 Overview

Traditional property and cadastral systems represent land parcels in two dimensions. However, modern built environments increasingly contain multiple layers of property and infrastructure above and below the ground surface.

**VPMS aims to:**
- Provide a 3D spatial interface for visualizing land and built structures
- Establish a foundation for vertical property identification
- Support integration with property and cadastral information systems
- Enable ULPIN-based property management workflows

The current prototype focuses on the **3D visualization layer and geospatial interface**.

## ✨ Key Features

- ⚡ **Interactive 3D Visualization** — Real-time 3D geospatial rendering
- 🗺️ **Map Integration** — Dual 2D/3D interface combining Leaflet and Three.js
- 🏗️ **Modern Architecture** — React + TypeScript with modular component structure
- 📦 **State Management** — Zustand for predictable application state
- 🎨 **Responsive UI** — Emotion-based styling with Lucide React icons
- 🔌 **Extensible Foundation** — Designed for future property and cadastral data integration

## 🛠️ Technology Stack

### Frontend
- **React** 18+ — UI framework
- **TypeScript** — Type-safe development
- **Vite** — Fast build tool and dev server

### 3D Visualization
- **Three.js** — 3D graphics library
- **React Three Fiber** — React renderer for Three.js
- **@react-three/drei** — Helpful utilities for R3F

### Mapping & Geospatial
- **Leaflet** — Interactive map library
- **React Leaflet** — React bindings for Leaflet

### State & HTTP
- **Zustand** — Lightweight state management
- **Axios** — HTTP client

### UI & Styling
- **Emotion** — CSS-in-JS styling
- **Lucide React** — Icon library

## 📁 Project Structure

```
VPMS/
├── src/
│   ├── api/            # API integration and data fetching
│   ├── components/     # Reusable React components
│   ├── state/          # Zustand state management
│   ├── theme/          # Theme and styling configuration
│   ├── three/          # Three.js and R3F utilities
│   ├── ui/             # UI component library
│   ├── utils/          # Helper functions and utilities
│   ├── global.d.ts     # Global type definitions
│   ├── index.css       # Global styles
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite environment types
│
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── LICENSE             # MIT License
```

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** v14 or higher
- **npm** v6 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ignxite/VPMS.git
cd VPMS
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```
Vite will output a local URL (typically `http://localhost:5173`) in your terminal.

### Production Build

Create an optimized production build:
```bash
npm run build
```

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## 🏛️ Architecture

The application follows a modular, layered architecture designed for extensibility:

```
        Geospatial / Spatial Data
                  │
                  ▼
          Application Layer
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   2D Map Layer        3D Visualization
     Leaflet           Three.js / R3F
        │                   │
        └─────────┬─────────┘
                  ▼
            User Interface
```

This modular design allows for seamless integration of:
- Cadastral data
- Property records
- Building/floor information
- Elevation and point-cloud data
- Infrastructure layers

## 🔮 Future Scope

The prototype can evolve into a complete 3D vertical property management platform through integration of:

### Data Integration
- Cadastral parcel boundaries
- ULPIN-linked property records
- Building and floor-level information
- GNSS/CORS-based positioning
- LiDAR and point-cloud data
- DEM/DSM elevation data

### Processing & Intelligence
- Automated building extraction
- Floor and vertical parcel segmentation
- Spatial topology validation
- Above-ground and underground infrastructure mapping

### User Features
- Property-level search and identification
- Role-based access control
- Administrative workflows
- Government and stakeholder portals

### Proposed Workflow
```
Spatial Data
     │
     ▼
Data Processing & Georeferencing
     │
     ▼
3D Reconstruction
     │
     ▼
Building / Floor / Parcel Segmentation
     │
     ▼
Spatial & Topological Validation
     │
     ▼
ULPIN / Property Association
     │
     ▼
3D Property Visualization
```

## 📊 Current Status

### ✅ Currently Implemented
- Web-based application framework
- Interactive geospatial visualization
- 3D visualization foundation
- React-based modular frontend architecture
- Integrated 2D map and 3D visualization
- Responsive UI components

### 🚧 Planned Extensions
- 3D cadastral data integration
- Vertical property identification workflows
- ULPIN association and generation
- Automated spatial data processing pipelines
- Property and ownership data integration
- Validation and administrative workflows

## 🏆 Smart India Hackathon

This project is being developed as a proposed solution for **Smart India Hackathon 2026** — Problem Statement 11: *3D ULPIN Generation and Vertical Property Mapping System*.

The broader objective is to transition from conventional two-dimensional property representation toward a spatially aware three-dimensional model of land and property.

## ⚠️ Disclaimer

VPMS is an evolving prototype. Features described under **Future Scope** represent proposed extensions and are not necessarily implemented in the current repository. The codebase is actively developed and subject to significant changes.

## 📄 License

This project is distributed under the **MIT License**. See [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for modern geospatial visualization**
