# Repository Guidelines

Follow these notes to ship dependable updates to the Aptos Explorer codebase.

## Project Structure & Module Organization

### Core Directories

- **`app/`** — Main TanStack Start application
  - `routes/` — File-based routing with TanStack Router (e.g., `account.$address.tsx` for `/account/:address`)
  - `pages/` — Page components organized by feature (Account, Analytics, Block, Transaction, Validators, etc.)
  - `components/` — Shared UI components (Table, IndividualPageContent, layout elements)
  - `api/` — Data layer with React Query hooks and GraphQL clients
  - `context/` — React contexts (color-mode, wallet-adapter)
  - `utils/` — Utility functions for address formatting, number conversion, validation
  - `lib/` — Constants and low-level utilities
  - `themes/` — MUI theme configuration and brand colors
  - `types/` — Shared TypeScript types (keep types close to usage unless broadly shared)
  - `assets/` — Static assets (SVGs, images)

- **`src/`** — Legacy/compatibility code; prefer `app/` for new work unless updating existing `src/` consumers

- **`public/`** — Static files served at root (favicons, robots.txt, social images)

- **`analytics/`** — SQL queries and instrumentation helpers for analytics dashboards

- **Generated/Disposable** — `dist/`, `build/`, `.tanstack/`, `app/routeTree.gen.ts`

### API Layer Structure

The `app/api/` directory contains:
- `hooks/` — React Query hooks following `useGet*` naming (e.g., `useGetAccount`, `useGetTransaction`)
- `hooks/delegations/` — Delegation/staking-specific hooks
- `graphql/` — GraphQL client setup and queries
- `client.ts`, `createClient.ts` — Aptos SDK client configuration
- `queries.ts`, `query-utils.ts` — Query key factories and utilities

### Page Organization Pattern

Each page feature typically includes:
- `Index.tsx` — Main page component
- `Title.tsx` — Page header/title component
- `Tabs.tsx` — Tab navigation component
- `Tabs/` — Individual tab content components
- `Components/` — Feature-specific components
- `Error.tsx` — Error boundary/fallback component
- `hooks/` — Feature-specific hooks
- `constants.ts` — Feature-specific constants

## Build, Test, and Development Commands

- `pnpm install` — Sync dependencies against the lockfile
- `pnpm dev` — Launch Vite dev server on port 3030
- `pnpm start` — Launch Vite dev server on port 3000
- `pnpm build` — Bundle for production
- `pnpm test` — Run Vitest; add `--run` in CI for non-watch mode
- `pnpm lint` — Run `tsc --noEmit` and ESLint
- `pnpm fmt` — Apply Prettier formatting

## Coding Style & Naming Conventions

### Formatting
- Prettier enforces 2-space indentation, trailing commas, double quotes, and tight bracket spacing
- Do not override Prettier configuration locally

### Component Patterns
- Use functional React components with PascalCase file names (e.g., `AccountTable.tsx`)
- Hooks use the `useX` prefix (e.g., `useGetAccount`, `useLocalnetDetection`)
- Default exports for page entry points; named exports for shared pieces requiring tree-shaking

### Routing
- Routes use TanStack Router file-based routing in `app/routes/`
- Dynamic segments use `$param` syntax (e.g., `account.$address.tsx`)
- Nested routes use dot notation (e.g., `account.$address.$tab.tsx`)
- The route tree is auto-generated in `app/routeTree.gen.ts`

### Data Fetching
- Use React Query hooks from `app/api/hooks/`
- Create new hooks following existing patterns with `useQuery` or `useSuspenseQuery`
- Query keys should be unique and include all dependencies
- Mock network calls in tests; never hit live Aptos endpoints

## Testing Guidelines

- Use Vitest for unit coverage
- Test files mirror source names: `foo.test.ts` or `Component.test.tsx` beside implementation
- Mock network calls with React Query utilities or fixtures
- Target:
  - Formatting helpers and utility functions
  - Query transformers and data processing logic
  - Regression tests when fixing bugs
- Existing test examples:
  - `app/utils/utils.test.ts` — Utility function tests
  - `app/pages/layout/Search/searchUtils.test.ts` — Search utility tests
  - `app/components/IndividualPageContent/ContentValue/CurrencyValue.test.tsx` — Component tests

## Commit & Pull Request Guidelines

- Write concise, imperative commit subjects with optional scope: `feat(network-select): exclude hidden networks from dropdown`
- Bundle related changes only; confirm lint and test success before pushing
- PRs need:
  - Short summary of changes
  - Linked issue when available
  - Screenshots or GIFs for UI adjustments
- Tag domain reviewers (routing, analytics, data tables) and note follow-up items or known gaps

## Configuration Notes

### Environment Setup
1. Copy `.env.example` to `.env.local` (or `.env`)
2. Configure required variables:

```bash
# API Keys (optional - defaults exist for public use)
VITE_APTOS_MAINNET_API_KEY=AG-YOUR-KEY
VITE_APTOS_TESTNET_API_KEY=AG-YOUR-KEY
VITE_APTOS_DEVNET_API_KEY=AG-YOUR-KEY

# Analytics (optional)
REACT_APP_GTM_ID=GTM-XXXXXXX
GA_TRACKING_ID=G-XXXXXXXXXX
```

### Variable Prefixes
- `VITE_*` — Exposed to client-side bundle
- `REACT_APP_*` — Also supported for compatibility
- Other variables — Only available at build time

### Security
- Never commit `.env.local` or `.env` files with real secrets
- Production secrets should be configured in deployment platform (e.g., Netlify)
- Default API keys are public rate-limited identifiers safe for client-side use

## Key Dependencies

- **React 19** — UI framework
- **TanStack Router** — File-based routing with type safety
- **TanStack Query (React Query)** — Server state management
- **MUI (Material UI) 7** — Component library
- **Aptos TS SDK** — Blockchain interaction
- **Chart.js + react-chartjs-2** — Analytics visualizations
- **Vitest** — Testing framework
- **Vite** — Build tool and dev server

## Common Patterns

### Creating a New Page
1. Add route file in `app/routes/` (e.g., `myfeature.tsx`)
2. Create page components in `app/pages/MyFeature/`
3. Add data hooks in `app/api/hooks/` if needed
4. Route tree regenerates automatically on dev server

### Adding a Data Hook
1. Create hook in `app/api/hooks/` following `useGet*.ts` pattern
2. Use `useQuery` or `useSuspenseQuery` from TanStack Query
3. Define query key in the hook or `query-utils.ts`
4. Export from `app/api/hooks/index.ts`

### Adding a Shared Component
1. Create in `app/components/` with PascalCase naming
2. Co-locate tests as `Component.test.tsx`
3. Export from appropriate index file if broadly used
