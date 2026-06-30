# Master Build Plan: Ligtas-Lakbay

This document outlines the detailed, step-by-step master plan to build the Ligtas-Lakbay navigation web application. It specifies what APIs are needed, where they must be configured, and at which step they are injected. It is fully configured for deployment on Vercel using Supabase PostgreSQL, designed from the ground up as a mobile-first architecture.

---

## 1. Required APIs & Configuration Locations

Before starting construction, ensure the following API credentials are set in your local environment file (`.env.local`):

| API Name | NPM Package / Integration | Key Name | Purpose | Injection Step |
| :--- | :--- | :--- | :--- | :--- |
| **Google Maps JS API** | `@react-google-maps/api` | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Render map canvas, place markers | Step 5.1 |
| **Google Places API** | Google Maps Autocomplete | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Autocomplete "Where To" & "From" inputs | Step 6.1 |
| **Google Routes API** | Google Directions Service | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Retrieve direction path coordinates | Step 6.2 |
| **Google Cloud Vision**| `@google-cloud/vision` | `GOOGLE_APPLICATION_CREDENTIALS` | Image classification & hazard confirmation | Step 3.2 |
| **Prisma ORM (Supabase)**| `@prisma/client` | `DATABASE_URL` & `DIRECT_URL` | Connect to hosted PostgreSQL database | Step 2.1 |

---

## 2. Chronological Implementation Steps

### Phase 1: Environment Setup & Project Initialization
#### Step 1.1: Initialize Next.js Project
- **What to do:** Create the base Next.js application using TypeScript and Vanilla CSS Modules. Establish `/app`, `/components`, `/lib`, `/styles`, and `/prisma` directory structures.
- **Verification:** Execute `npm run dev` and ensure the application boots on `http://localhost:3000` with no compilation errors.

#### Step 1.2: Install Core Dependencies
- **What to do:** Install the npm packages: `@react-google-maps/api`, `@google-cloud/vision`, `@prisma/client`, and development dependencies: `prisma`, `typescript`, `@types/react`.
- **Verification:** Inspect `package.json` to verify packages are installed.

#### Step 1.3: Configure Local Environment Variables
- **What to do:** Create `.env.local` file by copying `.env.local.example`. Input Google Maps API credentials, local path to Google Cloud credentials file, and Supabase connection string URLs:
  - `DATABASE_URL`: Transaction pool connection (usually port 6543) for serverless queries.
  - `DIRECT_URL`: Direct session connection (usually port 5432) for running migrations.
- **Verification:** Check that a script referencing `process.env.DATABASE_URL` successfully reads the value.

---

### Phase 2: Database Setup & Supabase Integration
#### Step 2.1: Bootstrap Prisma Schema
- **What to do:** Write the database schema configuration in `/prisma/schema.prisma` declaring the `postgresql` provider and referencing `DATABASE_URL` and `DIRECT_URL` environment variables. Declare the `HazardReport` model.
- **Verification:** Run `npx prisma validate` to confirm correct configuration syntax.

#### Step 2.2: Execute DB Migrations on Supabase
- **What to do:** Run the database initialization migration script to create the tables directly inside your Supabase project:
  ```bash
  npx prisma migrate dev --name init
  ```
- **Verification:** Inspect the Supabase project dashboard (Table Editor) and verify that the `HazardReport` table was created.

#### Step 2.3: Implement Database Seeding Script
- **What to do:** Create `/prisma/seed.ts` containing mock hazard reports (floods, broken wheelchair ramps, blocked pathways) positioned around the Metro Manila MVP area. Run `npx prisma db seed`.
- **Verification:** Use the Prisma Studio console (`npx prisma studio`) or check the Supabase dashboard to verify the seeded records are present.

---

### Phase 3: Backend API Route Development
#### Step 3.1: Develop Hazard Reports API Route
- **What to do:** Create the API endpoint `/app/api/reports/route.ts` containing:
  - `GET`: Queries Supabase database using Prisma Client for all active, verified hazard reports.
  - `POST`: Creates a new report record with coordinate locations and returns the created model.
- **Verification:** Query `http://localhost:3000/api/reports` with a tool or browser to verify it returns a JSON list of seeded hazards.

#### Step 3.2: Develop Vision API Photo Verification Route
- **What to do:** Create `/app/api/vision/route.ts` to accept an attached image payload, forward it to the Google Cloud Vision API, analyze returned image classification labels (e.g. "flooding", "water", "sidewalk", "barrier"), and return validation status (`isValidated: true/false`).
- **Verification:** Send a POST request containing a sample photo to `/api/vision` and check the JSON response structure.

---

### Phase 4: Styling & Design Tokens
#### Step 4.1: Establish Global Styles and Themes
- **What to do:** Write `/styles/globals.css` specifying Outfit typography imports, design tokens (deep black background, glowing gradients for routing modes, standard spacing), and glassmorphic card helper classes.
- **Verification:** Ensure page layouts render the Outfit font and dark-mode styling accurately.

---

### Phase 5: Map Engine Integration
#### Step 5.1: Embed Interactive Google Maps Canvas
- **What to do:** Create `/components/Map.tsx`. Load Google Maps JS engine using the `useJsApiLoader` hook with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Display full-screen interactive canvas centered on coordinates. Fetch hazard reports from `/api/reports` and display them on the map as custom markers.
- **Verification:** Load app home page, verify map canvas displays, and confirm seeded hazard markers render at their database coordinates.

---

### Phase 6: Initial Route Picker & Profile Routing Logic
#### Step 6.1: Develop Initial Location Picker & Floating Search Bar
- **What to do:** 
  - Create `/components/LocationPicker.tsx`. This screen is rendered overlaying the map on entry (post-splash). It prompts for "From" and "Where To" locations. Enable autocomplete suggestions by attaching the Google Places API Autocomplete hook to input fields.
  - Create `/components/SearchOverlay.tsx`. A floating bar displayed on the map dashboard after locations are confirmed, allowing the user to modify the "from" and "to" points at any time.
- **Verification:** Type query addresses in the location picker inputs and verify autocomplete options dropdown. Confirm coordinates save to state and render the main map layout.

#### Step 6.2: Integrate Google Routes API with Profile Routing Logic
- **What to do:** Develop path rendering logic in `/components/Map.tsx` calling the Google Directions Service. Adjust the computed routes using active hazard coordinates:
  - **Wheelchair Mode:** Reroute to bypass elements in database categorized as `RAMP_BLOCKED` or `ELEVATOR_BROKEN` (severe).
  - **Student Mode:** Highlight covered transit options or shaded areas.
  - **Rain Mode:** Re-route to bypass coordinates with severe `FLOOD` category records.
- **Verification:** Select different routing profile modes and confirm that the routing line shifts path to avoid nearby active hazard markers.

---

### Phase 7: Smart Hazard Reporting UI
#### Step 7.1: Build Hazard Report Modal & Image Upload Form
- **What to do:** Implement `/components/HazardModal.tsx` allowing users to:
  - Choose a hazard category (Flooding, Obstacle, Accessibility Outage).
  - Pick location coordinates on the map.
  - Select/snap verification photos.
  - Submit the record. Submitting must call `/api/vision` first to verify the image, then call `/api/reports` to save to Supabase database.
- **Verification:** Trigger the reporting flow, select a location, upload an image, and submit. Verify that a verification loading screen displays, and a new validated pin is instantly added to the map.
