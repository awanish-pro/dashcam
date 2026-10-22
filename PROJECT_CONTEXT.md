# Project Context: Nagar Dristi (Kanpur Nagar Nigam)

## Overview
**Nagar Dristi** is a real-time road hazard, garbage, and pothole detection and monitoring GIS dashboard designed for Kanpur Nagar Nigam (KNN).

## Technology Stack
- **Runtime**: React 19 & React DOM 19
- **Build Tooling**: Vite 8 & TypeScript 5.7
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), Vanilla CSS tokens in `src/index.css`
- **Mapping**: Leaflet 1.9 with custom animated SVG/CSS ripple markers & Google Maps satellite/street tiles
- **Formatting**: oxfmt

## Project Structure
```
knnsysdash/
├── public/
│   └── favicon.svg           # Application favicon
├── src/
│   ├── main.tsx              # React mounting entrypoint
│   ├── App.tsx               # Main application (GIS Map, Hazard Table, Filters, Preview, Users)
│   ├── index.css             # Design tokens, Leaflet ripple animations, global styles
│   └── vite-env.d.ts         # Vite client type definitions
├── .figma/make/              # Figma Make development & preview integration files
├── vite.config.ts            # Vite configuration with React, Tailwind v4, and Figma plugins
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and build scripts
```

## Core Workflows & Commands
- `npm run dev`: Launches Vite dev server (default port 8443).
- `npm run build`: Type-checks and creates production build in `dist/`.
- `npx tsc --noEmit`: Verifies TypeScript types without emitting files.
- `npm run format`: Runs oxfmt code formatter.

## Design System & Coding Conventions
- **Font Weights**: Strictly regular (`400`) and medium (`500`) only. Avoid bold (`600`/`700`).
- **Colors**: PGR Design System with primary blue (`#163b8d` / `#2563eb`), slate borders (`#e4e4e4`), background (`#fafafa`), and high-contrast text (`#1a1a1a`).
- **Strings**: Use double quotes for strings containing apostrophes (`"We're here"`).
- **Branch Workflow**: Active feature branch is `awanish-dashcam`, synced with `main`.
