# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a React TypeScript application built with Vite and managed with pnpm.

**Essential Commands:**

- `pnpm install` - Install dependencies
- `pnpm start` or `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production (includes TypeScript type checking)
- `pnpm lint` - Run TypeScript type checking and ESLint with zero warnings policy
- `pnpm fmt` - Format code with Prettier
- `pnpm test` - Run tests with Vitest
- `pnpm serve` - Preview production build

**Code Quality:**

- Lint-staged and Husky are configured for pre-commit hooks
- ESLint enforces zero warnings (`--max-warnings 0`)
- Prettier handles code formatting

## Architecture Overview

**Core Structure:**

- **Entry Point**: `src/index.tsx` - Sets up React app with QueryClient, BrowserRouter, and telemetry
- **Routing**: `src/ExplorerRoutes.tsx` - Defines all application routes with lazy-loaded components
- **Global State**: `src/global-config/GlobalConfig.tsx` - Manages network selection and API clients
- **API Layer**: `src/api/` - Contains React Query hooks and API client configurations

**Key Architectural Patterns:**

- **Multi-Network Support**: The app dynamically connects to different Aptos networks (mainnet, devnet, testnet, etc.)
- **Dual SDK Approach**: Uses both legacy `aptos` SDK (v1) and new `@aptos-labs/ts-sdk` (v2) for API calls
- **React Query**: All API calls are wrapped in React Query hooks for caching and state management
- **Lazy Loading**: Route components are lazy-loaded for performance

**Data Flow:**

1. `GlobalStateProvider` manages network/feature selection and creates API clients
2. Page components use React Query hooks from `src/api/hooks/`
3. API hooks use clients (AptosClient, IndexerClient, Aptos SDK v2) configured in GlobalConfig
4. Components render data with MUI components and custom design system

**Directory Structure:**

- `src/pages/` - Route components organized by feature (Account, Transaction, Validators, etc.)
- `src/components/` - Reusable UI components and MUI customizations
- `src/api/hooks/` - React Query hooks for API calls
- `src/global-config/` - Network and feature configuration
- `src/themes/` - MUI theme customization
- `analytics/` - SQL queries for analytics features

**Testing:**

- Uses Vitest for testing
- Tests are co-located with components (`.test.tsx` files)

**Build System:**

- Vite with React plugin and SVGR for SVG handling
- TypeScript with strict mode enabled
- Environment variables support both `VITE_` and `REACT_APP_` prefixes
- Source maps enabled for debugging

**Network Configuration:**
The app supports multiple Aptos networks through the GlobalConfig system. Network selection affects:

- API endpoints (fullnode and indexer)
- GraphQL endpoints
- SDK client configuration
- Available features per network

**SDK Compatibility Layer:**

- `src/compatibility.ts` provides conversion functions between legacy `aptos` package and new `@aptos-labs/ts-sdk`
- `LegacyCompatibilityWrapper` class offers drop-in replacement for legacy API calls
- Supports gradual migration from v1 to v2 SDK

**Network Constants:**

- Network URLs defined in `src/constants.tsx`
- API keys configured per network for rate limiting
- Known addresses and scam detection lists maintained
- Hardcoded coin metadata for major tokens

**Analytics Integration:**

- SQL queries in `analytics/` folder for generating chain statistics
- Data sourced from Google BigQuery public datasets
- Metrics include TPS, transactions, gas consumption, active users, and validator stats
