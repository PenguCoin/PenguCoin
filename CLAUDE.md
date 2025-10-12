# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using the App Router, built with React 18, TypeScript, and Tailwind CSS. The project is configured for deployment on Vercel and follows modern Next.js best practices.

## Development Commands

### Setup
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Starts the development server at http://localhost:3000 with hot module replacement.

### Building
```bash
npm run build
```
Creates an optimized production build. Next.js will generate static and server-rendered pages in the `.next` directory.

### Production Server
```bash
npm start
```
Runs the production build locally (must run `npm run build` first).

### Linting
```bash
npm run lint
```
Runs ESLint with Next.js configuration to check for code issues.

### Testing
```bash
npm test          # Run all tests
npm run test:watch  # Run tests in watch mode
```

## Architecture

### Directory Structure

- **`/app`** - Next.js App Router directory containing pages, layouts, and route handlers
  - `layout.tsx` - Root layout wrapping all pages
  - `page.tsx` - Home page component
  - `globals.css` - Global styles and Tailwind directives

- **`/components`** - Reusable React components shared across the application
  - Use this for UI components, forms, cards, buttons, etc.

- **`/lib`** - Utility functions, helper code, and shared business logic
  - Use this for API clients, data fetching utilities, formatters, validators, etc.

- **`/public`** - Static assets served from the root URL
  - Images, fonts, favicon, robots.txt, etc.

### Key Technologies

- **Next.js 15** with App Router (React Server Components by default)
- **TypeScript** with strict mode enabled
- **Tailwind CSS** for styling with PostCSS processing
- **ESLint** with Next.js recommended configuration

## App Router Patterns

### Server vs Client Components

- Components in `/app` are Server Components by default
- Add `'use client'` directive at the top of files that need:
  - React hooks (useState, useEffect, etc.)
  - Event handlers (onClick, onChange, etc.)
  - Browser-only APIs (localStorage, window, etc.)

### File Conventions

- `page.tsx` - Public route accessible at the URL path
- `layout.tsx` - Shared UI that wraps pages (preserves state, doesn't re-render)
- `loading.tsx` - Loading UI shown while page loads (automatic Suspense boundary)
- `error.tsx` - Error UI for handling errors in routes
- `route.ts` - API endpoint (GET, POST, etc.)

### Data Fetching

Server Components can fetch data directly:
```typescript
async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{data.title}</div>
}
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Vercel auto-detects Next.js and configures build settings
4. Deploy with automatic CI/CD on every push to main

### Manual Vercel CLI
```bash
npm i -g vercel
vercel
```

## Configuration Files

- **`next.config.js`** - Next.js framework configuration
- **`tsconfig.json`** - TypeScript compiler options and path aliases
- **`tailwind.config.ts`** - Tailwind CSS theme and content paths
- **`postcss.config.mjs`** - PostCSS plugins for CSS processing
- **`.eslintrc.json`** - ESLint rules extending Next.js config
- **`package.json`** - Dependencies and npm scripts
