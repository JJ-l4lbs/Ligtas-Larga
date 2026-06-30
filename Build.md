# Master Execution Plan: Ligtas-Lakbay

## Phase 1: Environment Setup & Project Initialization
### Step 1.1: Initialize Next.js Project
- **Implementation:** Initialize a Next.js application in the root using React, TypeScript, and vanilla CSS modules. Create file structure representing App Router conventions.
- **Verification:** Run `npm run dev` and confirm the local development server starts successfully on port `3000`.

### Step 1.2: Install Core Dependencies
- **Implementation:** Install `@prisma/client`, Prisma CLI, `@react-google-maps/api`, and `@google-cloud/vision` client package.
- **Verification:** Inspect `package.json` and ensure all packages are listed under dependencies or devDependencies.

---

## Phase 2: Database Setup & Prisma Integration
### Step 2.1: Initialize Prisma & Schema Sync
- **Implementation:** Configure `prisma/schema.prisma` mapping the SQLite database format matching `Schema.md`. Run prisma migration scripts.
- **Verification:** Generate Prisma Client and inspect SQLite file (`dev.db`) existence. Run a quick seed script to verify reads and writes work.

---

## Phase 3: Backend API Development
### Step 3.1: Develop Hazard Reports API Route
- **Implementation:** Create API route (`/app/api/reports/route.ts`) to handle `GET` requests (fetching all active hazards) and `POST` requests (creating a new report).
- **Verification:** Send mock HTTP requests using a client script to verify payload parsing and database writing.

### Step 3.2: Develop Vision API Verification Route
- **Implementation:** Create API route (`/app/api/vision/route.ts`) to handle mock/live photo labels checking via Google Cloud Vision API. Extract relevant labels (e.g. `flooding`, `construction`, `pothole`) and return verification status.
- **Verification:** Run unit test calling API endpoint with sample image, validating that labels are processed and returned correctly.

---

## Phase 4: Styling & UI Layout foundation
### Step 4.1: Create CSS Design Token Framework
- **Implementation:** Create `/styles/globals.css` with color variables, Outfit typography, and generic classes for glassmorphic elements (`backdrop-filter`).
- **Verification:** Open application base layout page and verify the typography font and dark color scheme are correctly rendered.

---

## Phase 5: Map Engine Integration
### Step 5.1: Integrate Google Maps Component
- **Implementation:** Create a reusable map canvas component (`components/Map.tsx`) loaded with Google Maps JS library. Display a custom map centered on the MVP region (e.g. Metro Manila University belt).
- **Verification:** Load main page on browser and confirm interactive map canvas displays correctly without console warnings.

---

## Phase 6: Multi-Profile Routing Logic
### Step 6.1: Develop Navigation Drawers & Profile Pickers
- **Implementation:** Implement components `/components/ProfileSelector.tsx` for routing options. Construct routing handlers that requests Google Routes API paths and adjusts/overlays routing points dynamically depending on active user selections:
  - Avoid points containing severe hazards.
  - Shade routing overlays.
  - Accessibility routing prioritizing step-free paths.
- **Verification:** Trigger profile switches and verify route updates and overlays are displayed correctly on the map canvas.

---

## Phase 7: Smart Hazard Reporting UI
### Step 7.1: Construct Custom Reporting Modal & Photo Upload
- **Implementation:** Implement modal window `/components/HazardModal.tsx` allowing image attachment, name classification, and description. Connect submissions to the Reports and Vision verification API routes.
- **Verification:** Submit sample hazard details, check upload loading indicator state transitions, and verify database update triggers marker render.
