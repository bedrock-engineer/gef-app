# Bedrock GEF Viewer

Free, open-source web application for viewing and visualizing GEF (Geotechnical Exchange Format) files

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**Live Demo:** [gef.bedrock.engineer](https://gef.bedrock.engineer)

## About

GEF files are ubiquitous in geotechnical engineering in the Netherlands and Flanders. This web application provides a fast, modern interface for viewing and analyzing GEF files directly in your browser.

### Supported GEF Types

- GEF-CPT
    - Basisregistratie Ondergrond Additions
    - Databank Ondergrond Vlaanderen Additions
- GEF-BORE

## Technology Stack

- **Framework**: [React Router v7](https://reactrouter.com/) with Server-Side Rendering
- **Build Tool**: [Vite](https://vite.dev/)
- **Language**: TypeScript (strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualization**: [Observable Plot](https://observablehq.com/plot/)
- **Maps**: [Leaflet](https://leafletjs.com/)
- **UI Components**: [React Aria Components](https://react-spectrum.adobe.com/react-aria/)
- **Internationalization**: [i18next](https://www.i18next.com/)
- **Schema Validation**: [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
git clone https://github.com/yourusername/gef-webapp.git
cd gef-webapp

npm install

npm run dev
```

The app will be available at `http://localhost:5173`

### Development Commands

```bash
npm run dev        # Start development server with HMR
npm run build      # Create production build
npm run start      # Start production server
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## Project Structure

```
gef-webapp/
├── app/
│   ├── components/        # React components
│   ├── gef/              # GEF file parsing and schemas
│   ├── locales/          # Translation files
│   ├── middleware/       # Request middleware
│   ├── routes/           # Route components
│   └── util/             # Utility functions
├── public/               # Static assets
└── workers/              # Web workers
```

## Deployment

This application can be deployed to various platforms. See [React Router](https://reactrouter.com/start/framework/deploying).

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Run `npm run typecheck` before committing
2. Follow the existing code style
3. Add tests for new features
4. Update documentation as needed

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/yourusername/gef-webapp/issues)
- **Live App**: Try it at [gef.bedrock.engineer](https://gef.bedrock.engineer)
