# Contextual Memory Log: Ligtas-Lakbay

## Current Context
The base Next.js application is initialized with App Router, TypeScript, and Vanilla CSS. We have installed all required dependencies including Google Maps API, Prisma ORM, and PostgreSQL adapter (`@prisma/adapter-pg` and `pg`). The development server is active, compiling cleanly, and serving the homepage at `http://localhost:3000`.

---

## Accomplished Tasks
- Created `PID.md` detailing project scope, audience, MVP features, objectives, success metrics, and constraints.
- Created `Design.md` defining design philosophy, typography, interface layouts, and interaction blueprints, including a user-side page flow diagram.
- Created `Architecture.md` defining tech stack, schema flows, database structure, testing setups, and code formats.
- Created `Schema.md` outlining data tables, field metrics, and Prisma models.
- Created `Build.md` mapping out step-by-step development phases and verification checkpoints.
- Created `Progress.md` tracking charts for frontend and backend tasks.
- Created `.gitignore` to exclude the `.agents/` folder and its files.
- Updated `Architecture.md` with a high-fidelity Mermaid webapp flow diagram and the current workspace file structure.
- Switched verification API references from Google Cloud Vision to Hugging Face Inference API.
- Replaced experimental Places Web Components in `LocationPicker.tsx` with standard Google Places Autocomplete on native React inputs.
- Created server-side Routes API proxy endpoint `/app/api/routes/route.ts` to call the modern Google Routes API (`/v2:computeRoutes`).
- Rewrote `Map.tsx` and `LocationPicker.tsx` to use native Maps JS API (`AdvancedMarkerElement` and custom elements).
- Replaced `@react-google-maps/api` custom loader in `Map.tsx` with a native singleton script loader hook (`useGoogleMapsLoader`).
- Audited `Map.tsx` and resolved async race conditions in marker and route calculations.
- Resolved TypeScript window.google global type declaration errors.
- Added `@types/google.maps` devDependency and resolved type namespace loading issues.
- Fixed suggestions dropdown clipping by setting `overflow: visible` on input containers in `LocationPicker.tsx`.
- Corrected Google Routes API v2 endpoint path in `/app/api/routes/route.ts`.
- Cleaned and reinstalled `node_modules` on Windows to resolve file lock conflicts (`ENOTEMPTY` / `EPERM`).
- Installed `@prisma/adapter-pg` and `pg` dependencies along with `@types/pg` devDependency to resolve the runtime Prisma module resolution crash.
- Created local binary shims for Next.js in `node_modules/.bin` and successfully booted the dev server.

---

## Immediate Next Objectives
1. Configure SQLite database via Prisma ORM and generate schema client matching Phase 2, Step 2.1 in `Build.md`.
2. Develop backend API routes (`/api/reports` and `/api/vision`).
3. Set up frontend components and page layouts.

---

## Execution Logs & Attempts
- *Attempt 1:* Successfully created all requested `.md` specifications based on the user's project descriptions and rules set by `GEMINI.md`.
- *Attempt 2:* Addressing `ApiProjectMapError` by introducing high-fidelity interactive SVG mock map overlay and documenting API key setups.
- *Attempt 3:* Documenting project folder structure and user flow mappings in the architectural specs.
- *Attempt 4:* Adjusted navigation flow definitions to include the route query setup.
- *Attempt 5:* Resetting status, mapping out a unified flow diagram and concrete API integration plan.
- *Attempt 6:* Creating the comprehensive web app flow diagram artifact requested by the user.
- *Attempt 7:* Updated Architecture.md with the web app flow diagram and the workspace file structure.
- *Attempt 8:* Adjusted the page flow diagram in Design.md to collect origin/destination via an initial location picker immediately after the splash screen, before transitioning to the main map dashboard.
- *Attempt 9:* Synchronized Build.md (Phase 6 split) and Progress.md (FE-6.1 / FE-6.2 tasks) specifications with the new page flow.
- *Attempt 10:* Fully detailed Build.md and Progress.md, detailing exact API keys, NPM packages, injection steps, and action items for both frontend and backend tasks.
- *Attempt 11:* Refactored Architecture.md, Schema.md, Build.md, and Progress.md to replace SQLite references with Supabase PostgreSQL to ensure full compatibility with Vercel deployment.
- *Attempt 12:* Accessed Supabase via the MCP server, retrieved the project URL and publishable API keys, and prepared to write them into `.env.local`.
- *Attempt 13:* Bootstrapping Prisma schema in `prisma/schema.prisma` using the verified Supabase connection string.
- *Attempt 14:* Modified Prisma setup for Prisma 7 compatibility (moved datasource configuration to `prisma.config.ts`), applied migration via Supabase `apply_migration` MCP tool, and successfully seeded mock records via `execute_sql`. Noted that Row Level Security (RLS) is disabled for the `public.HazardReport` table and successfully enabled it with read/write policies.
- *Attempt 15:* Creating the shared Prisma client helper at `lib/prisma.ts` using the new driver adapter for PostgreSQL.
- *Attempt 16:* Developing the `/app/api/reports/route.ts` Next.js API route handler to fetch and save hazard reports.
- *Attempt 17:* Creating `/app/api/vision/route.ts` to verify hazard report images using the Hugging Face Inference API.
- *Attempt 18:* Creating global stylesheet at `styles/globals.css` with Google Font (Outfit) imports, CSS custom properties, and glassmorphic utility classes.
- *Attempt 19:* Creating the Next.js root layout at `app/layout.tsx` to wrap pages and apply global CSS.
- *Attempt 20:* Creating the interactive Google Maps component in `/components/Map.tsx` and incorporating it into `/app/page.tsx` as the main view.
- *Attempt 21:* Creating `next.config.ts` to enable `cacheComponents` and resolving route segment configurations errors.
- *Attempt 22:* Generated Prisma client via `npx prisma generate` and successfully compiled the Next.js application using `npm run build`.
- *Attempt 23:* Implementing the Google Autocomplete input panels, sliding profile drawer, and custom safe route calculations bypassing active hazards.
- *Attempt 24:* Creating `/components/HazardModal.tsx` containing category selections, photo upload converts, Hugging Face validation, and database submissions.
- *Attempt 25:* Integrated all components together, verified the build compiles without errors, and synchronized the final Progress ledger.
- *Attempt 26:* Added Google Maps API key warning guide and implemented the Splash Screen loader step matching the Design flow diagram.
- *Attempt 27:* Migrated autocomplete inputs to modern Places API (New) `gmp-place-autocomplete` web components to avoid LegacyApiNotActivatedMapError.
- *Attempt 28:* Restored the correct Supabase project ID (`wsjsiwnvtesusmipcvpp`) in `.env.local` database URLs.
- *Attempt 29:* Restored missing Supabase URL and Anon/Publishable API keys to the bottom of `.env.local`.
- *Attempt 30:* Corrected the database pooler region from `ap-southeast-1` (Singapore) to `ap-northeast-1` (Tokyo) based on DNS/Server network resolution checks.
- *Attempt 31:* Restored region to `ap-southeast-1` (Singapore) based on user confirmation, and documented password URL-encoding necessity to resolve parsing/connection errors.
- *Attempt 32:* Changed database pooler and direct URL region to `ap-northeast-1` (Tokyo) as requested by the user.
- *Attempt 33:* Identified that the pooler service is not active for the project, causing ENOTFOUND tenant errors across all pooler regions. Changed both `DATABASE_URL` and `DIRECT_URL` to point to the working direct connection endpoint `db.wsjsiwnvtesusmipcvpp.supabase.co`.
- *Attempt 34:* Replaced experimental Places Web Components in `LocationPicker.tsx` with standard Google Places Autocomplete on text inputs, and implemented a geocoder/mock fallback on submit so the "Calculate Safe Route" button is click-enabled.
- *Attempt 35:* Created server-side Routes API proxy endpoint `/app/api/routes/route.ts` to call the modern Google Routes API (`/v2:computeRoutes`). Rewrote `Map.tsx` and `LocationPicker.tsx` to use native Maps JS API (`AdvancedMarkerElement` and custom elements) with no legacy wrappers.
- *Attempt 36:* Replaced `@react-google-maps/api` custom loader in `Map.tsx` with a native singleton script loader hook (`useGoogleMapsLoader`) to completely eliminate all legacy API warning side effects. Removed Map container `styles` warnings by aligning with Map ID cloud styling.
- *Attempt 37:* Audited `Map.tsx` and resolved async race conditions in marker and route calculations using cleanup flags. Replaced direct custom element `PinElement` assignment with `PinElement.element` for correct HTML integration.
- *Attempt 38:* Resolved TypeScript window.google global type declaration error by casting window references to any.
- *Attempt 39:* Added triple-slash references to google.maps types inside components using them, resolving namespace loading issues.
- *Attempt 40:* Reverted PinElement.element back to PinElement directly to eliminate the Google Maps JS SDK deprecation warning.
- *Attempt 41:* Updated GEMINI.md to add core engineering philosophy of relentless verification before completion using Playwright and closing the browser.
- *Attempt 42:* Refactored LocationPicker.tsx to use standard google.maps.places.Autocomplete on native React inputs to fix suggestion loading bugs.
- *Attempt 43:* Restored Places API (New) PlaceAutocompleteElement (gmp-place-autocomplete) to resolve LegacyApiNotActivatedMapError, and fixed the suggestions dropdown clipping by setting overflow: visible on input containers.
- *Attempt 44:* Corrected Google Routes API v2 endpoint path in app/api/routes/route.ts by adding /directions/, resolving the 404/502 route options fetch errors.
- *Attempt 45:* Resolved Prisma adapter-pg build error by installing `@prisma/adapter-pg` and `pg` dependencies along with `@types/pg` devDependency, performed a clean node_modules reinstallation to bypass locked handles, and successfully restarted development server.
