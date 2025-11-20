# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Router v7 application designed to view "Geotechnical Exchange Format" (GEF) files in the browser. The app uses server-side rendering by default and is built with TypeScript and Tailwind CSS.

## Development Commands

- `npm run dev` - Start development server with HMR at http://localhost:5173
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking (includes type generation)

## Architecture

### Framework Structure
- **React Router v7**: Uses file-based routing with SSR enabled by default
- **Vite**: Build tool with TypeScript paths and Tailwind CSS integration
- **TypeScript**: Strict mode enabled with ES2022 target

### Key Files
- `app/root.tsx` - Root layout component with error boundary
- `app/routes.ts` - Route configuration (currently just home route)
- `app/routes/` - Route components directory
- `react-router.config.ts` - React Router configuration (SSR enabled)
- `vite.config.ts` - Vite configuration with plugins

### Project Structure
- Routes are defined in `app/routes.ts` and implemented in `app/routes/`
- Shared components go in `app/` directory
- Static assets in `public/`
- TypeScript path alias `~/*` maps to `./app/*`

### Styling
- Tailwind CSS configured via Vite plugin
- Global styles in `app/app.css`
- Inter font loaded from Google Fonts

### Type Generation
The `typecheck` script runs `react-router typegen` to generate route types, then runs TypeScript compiler. Always run this after route changes.