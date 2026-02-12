# Bedrock GEF Viewer

Free, open-source web application for viewing and visualizing GEF (Geotechnical Exchange Format) files.
GEF is an outdated format, however GEF files are still ubiquitous in geotechnical engineering in the Netherlands and Flanders for CPT and bore data.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**Live Demo:** [gef.bedrock.engineer](https://gef.bedrock.engineer)

## About

<img src="/public/bedrock.svg" width="300px" alt="Bedrock Logo" />

This is a free web application by [Bedrock](https://bedrock.engineer) that provides a fast, modern interface for viewing and analyzing GEF files directly in your browser.
It also let's you download data from the GEF files as CSV or JSON, and the locations of multiple GEF files as GeoJSON.

### Supported GEF Types

- [GEF-CPT](https://bedrock.engineer/reference/formats/gef/gef-cpt/)
  - [Basisregistratie Ondergrond Additions](https://www.cptdata.nl/downloads/gef113Releasenotes.pdf)
  - [Databank Ondergrond Vlaanderen Additions](https://www.milieuinfo.be/confluence/display/DDOV/Toelichting+DOV-GEF+formaat)
- [GEF-BORE](https://bedrock.engineer/reference/formats/gef/gef-bore/)
- GEF-DISS

GEF-SIEVE files are not supported.

## Technology Stack

- **GEF Parsing**: [`@bedrock-engineer/gef-parser-ts](https://github.com/bedrock-engineer/gef-parser-ts) which uses [gef-file-to-map](https://github.com/cemsbv/gef-file-to-map) and [Zod](https://zod.dev/)
- **Framework**: [React Router v7](https://reactrouter.com/) with Server-Side Rendering
- **Build Tool**: [Vite](https://vite.dev/)
- **Language**: TypeScript (strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualization**: [Observable Plot](https://observablehq.com/plot/)
- **Maps**: [Leaflet](https://leafletjs.com/)
- **UI Components**: [React Aria Components](https://react-spectrum.adobe.com/react-aria/)
- **Internationalization**: [i18next](https://www.i18next.com/)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Local Development

```bash
git clone https://github.com/bedrock-engineer/gef-webapp.git
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
│   ├── components/       # React components
│   ├── gef/              # GEF file parsing and schemas
│   ├── locales/          # Translation files
│   ├── middleware/       # Request middleware
│   ├── routes/           # React-router route components
│   └── util/             # Utility functions
├── public/               # Static assets
└── workers/              # Cloudflare Workers
```

## Deployment

This application can be deployed to various platforms. See [React Router docs on deploying](https://reactrouter.com/start/framework/deploying).

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Run `npm run typecheck`, `npm run lint`, and `npm run knip`, read the warnings and use your best judgement before committing
2. Follow the existing code style
3. Adding tests for new features, or tests for existing code for that matter, is encouraged

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/bedrock-engineer/gef-webapp/issues) 
- **Live App**: Try it at [gef.bedrock.engineer](https://gef.bedrock.engineer)

[Bedrock](https://bedrock.engineer)
