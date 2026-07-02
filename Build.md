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
| **Hugging Face Inference API**| native fetch client | `HUGGING_FACE_API_KEY` | Image classification & hazard confirmation | Step 3.2 |
| **Prisma ORM (Supabase)**| `@prisma/client` | `DATABASE_URL` & `DIRECT_URL` | Connect to hosted PostgreSQL database | Step 2.1 |

---

## 2. Chronological Implementation Steps

### Phase 1: Environment Setup & Project Initialization
#### Step 1.1: Initialize Next.js Project
- **What to do:** Create the base Next.js application using TypeScript and Vanilla CSS Modules. Establish `/app`, `/components`, `/lib`, `/styles`, and `/prisma` directory structures.
- **Verification:** Execute `npm run dev` and ensure the application boots on `http://localhost:3000` with no compilation errors.

#### Step 1.2: Install Core Dependencies
- **What to do:** Install the npm packages: `@react-google-maps/api`, `@prisma/client`, and development dependencies: `prisma`, `typescript`, `@types/react`.
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

#### Step 3.2: Develop Hugging Face Photo Verification Route
- **What to do:** Create `/app/api/vision/route.ts` to accept an attached image payload, forward it to the Hugging Face Inference API (using a hosted open-source vision model), analyze returned labels (e.g. "flooding", "water", "sidewalk", "barrier"), and return validation status (`isValidated: true/false`).
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
  - Submit the record. Submitting must call `/api/vision` first to verify the image via Hugging Face API, then call `/api/reports` to save to Supabase database.
- **Verification:** Trigger the reporting flow, select a location, upload an image, and submit. Verify that a verification loading screen displays, and a new validated pin is instantly added to the map.

---

### Phase 8: Role-Based Session Management & Admin Validation Panel
#### Step 8.1: Supabase Auth & Session Integration
- **What to do:** Integrate Supabase Auth client helpers. Build a `/login` page for administrator and registered user sessions. Configure a database profile check or user metadata mapping to distinguish `Role: USER | ADMIN`. Unauthenticated sessions fall back to the default "Anonymous" role (read-only navigation & queue-restricted reporting).
- **Verification:** Navigate to `/login` and verify form elements render. Attempt access with incorrect credentials and confirm error indicators.

#### Step 8.2: Next.js Security Middleware & Route Protection
- **What to do:** Create `middleware.ts` in the project root. Configure it to intercept all admin routes under `/admin/*` and admin API handlers under `/api/admin/*`. Inspect session cookies or JWT role metadata, redirecting unauthenticated or non-admin users to `/login`.
- **Verification:** Attempt to navigate to `/admin` while unauthenticated and confirm immediate redirection to `/login`.

#### Step 8.3: Admin Verification Dashboard Layout
- **What to do:** Create page layout under `/app/admin/page.tsx`. Build a glassmorphic dashboard queue displaying all reports, highlighting `isValidated` status. Provide quick action buttons: "Approve / Verify", "Edit Description", and "Delete / Archive".
- **Verification:** Access `/admin` as an administrator and verify listing of all active and pending reports.

#### Step 8.4: Admin Review API Handlers
- **What to do:** Develop API routes under `/app/api/admin/reports/route.ts` supporting:
  - `PUT`: Allows updating a hazard report's status (e.g. toggling `isValidated`) or editing category/description.
  - `DELETE`: Allows removing resolved or false-alarm reports from Supabase.
- **Verification:** Verify that clicking "Approve" updates the database flag and renders the pin on the public map. Verify that "Delete" removes the report from the DB and map.

#### Step 8.5: Commuter Personalization, Profile Dashboard, Account Deletion, & Custom Dialogs
- **What to do:**
  - **Database Models:** Define `SavedPlace` and `SavedRoute` schema tables with Cascade-on-Delete relations to `UserProfile` inside `prisma/schema.prisma` and sync using `npx prisma db push`.
  - **API Endpoints:** Build `/api/saved-places` and `/api/saved-routes` route handlers for GET, POST, and DELETE actions. Integrate a database auto-sync helper inside `lib/auth-utils.ts` to generate missing profiles on session check.
  - **Personalization UI:** Design the sliding glassmorphic `UserProfileDashboard.tsx` displaying user credentials, saved place coordinates (with quick Start/Dest routing buttons), and saved routes (with instant travel profile filter recall).
  - **Duplicate Prevention:** Add strict case-sensitive unique label verification checks on saved place creation (rejecting duplicates of same case like "Home", but allowing variations like "HOME").
  - **Account Deletion:** Add a `DELETE` endpoint to `/api/auth/me` that deletes the PostgreSQL user profile, runs raw superuser SQL to delete from Supabase Auth (`auth.users`), clears session cookies, and redirects.
  - **Custom Toast & Modal Confirmations:** Implement React state-driven floating Toast notifications and custom Confirmation Modals in `Map.tsx` to replace browser `alert()` and `confirm()` globally.
- **Verification:** Restart Next.js dev server, sign in, save places/routes, verify successful/error custom toast notifications trigger, select saved route to verify filter recall, and verify account deletion deletes both Postgres profile and Supabase Auth records. Ensure `npm run build` compiles successfully.

#### Step 8.6: Admin Map Direct Pinning Controls
- **What to do:**
  - **Map Toggle Controls:** Integrate a toggle button (`🔨`) inside `MapControls.tsx` visible only to admins that switches to `✕` when active.
  - **Banner Overlay Indicator:** Render a status warning banner centered at the top of the map when active, prompting the admin that map click pinning is active and providing an "Exit" action.
  - **Auto-Exit Form Logic:** Modify `HazardModal.tsx` header to add a top-right `✕` exit button. When the modal closes (via successful submission or cancel/exit actions), automatically turn off active pinning mode state (`isAdminPinning`).
  - **Bypassed AI Verification:** Allow admins to skip photo attachments in `HazardModal.tsx` and instantly validate reports (`isValidated: true`) without calling the Hugging Face vision classifier route.
- **Verification:** Log in as administrator, toggle pinning mode, verify the red banner overlay displays at the top center, click on the map to open the reporting form pre-filled with the clicked coordinates, exit the form and verify pinning mode is disabled. Confirm direct placement without photo goes live on the map instantly.

---

### Phase 9: Commute, Bicycle, Motorcycle, and Car Travel Modes Integration
#### Step 9.1: Create Commute Fare Calculator Utility
- **What to do:** Build a utility library `/lib/commute-calculator.ts` containing the hardcoded JSON parsed values for:
  - LRT-1 (Single Journey and Stored Value matrices)
  - LRT-2 (Single Journey and Stored Value matrices)
  - MRT-3 (Fare matrix)
  - PNR (Fare matrix)
  - Jeepney (PUJ) (Distance-to-fare lookup list)
  - Public Bus (Aircon and Ordinary distance-to-fare lookup lists)
  Write matching logic to identify routes and fuzzy-match station names, returning segment fares, a total aggregated cost, and step-by-step cost annotations.
- **Verification:** Write a dry-run test for Roosevelt to Central LRT-1 fare lookup and PUJ/Bus distance lookups. Verify correct prices are outputted.

#### Step 9.2: Update Route API Route
- **What to do:** Modify `/app/api/routes/route.ts` to accept `travelMode` in the POST body. Map the travel mode to Google Routes API parameters:
  - `"walk"` -> `WALK`
  - `"commute"` -> `TRANSIT` (adding transitDetails to X-Goog-FieldMask)
  - `"bicycle"` -> `BICYCLE`
  - `"motorcycle"` -> `TWO_WHEELER`
  - `"car"` -> `DRIVE`
- **Verification:** Call the route API with different travelModes and verify the corresponding polyline paths match the chosen vehicle format.

#### Step 9.3: Add Travel Mode UI Selectors
- **What to do:** Modify `/components/LocationPicker.tsx` and `/components/LeftPanel.tsx` to display a modern, high-contrast travel mode selector bar (🚶, 🚌, 🚲, 🏍️, 🚗) with interactive hover and active states. Pass the selected mode down to the route calculator hook.
- **Verification:** Toggle through travel modes on the landing location setup screen and verify active state rendering.

#### Step 9.4: Update Routing Calculator Hook
- **What to do:** Modify `/components/useRouteCalculator.ts` to accept the selected travel mode. Forward it to `/api/routes` and update path styles:
  - Commute: Teal route line
  - Bicycle: Green route line
  - Motorcycle: Purple route line
  - Car: Slate route line
  For commute mode, call the fare calculator engine and output the total cost and step-by-step price segments.
- **Verification:** Run a route computation under Commute mode and verify that the teal line renders and the total cost state is calculated.

#### Step 9.5: Update Active Route UI Panel
- **What to do:** Modify `/components/ActiveRoutePanel.tsx` to display the aggregated travel cost (e.g. `Total Fare: ₱38.00`) next to the route metadata. Render individual segment fare annotations on the direction step items.
- **Verification:** Compute a commute route and check that the total fare displays at the top and individual step cards show segment costs.

#### Step 9.6: Commute Route Fallback, Estimations, & Split Direction Cards
- **What to do:**
  - Update `/app/api/routes/route.ts` to automatically detect when a commute request returns no direct transit routes/fares and fall back to a `DRIVE` (road network) route with estimated distance-based jeepney fares and warnings.
  - Propagate this warning via `/components/useRouteCalculator.ts` to `/components/ActiveRoutePanel.tsx`, and display a warning banner when active.
  - Split `/components/ImmediateActionCard.tsx` into a stylized Commute Turn-by-Turn Card (teal border theme, boarding stops, segment cost chips) and a Generic Turn-by-Turn Card (standard walk/drive control directions).
- **Verification:** Run a route calculation between places with no transit connections under commute mode. Confirm the estimated road route renders, the estimated fare is calculated and displayed, and the warning banner is present. Confirm that steps with fares use the commute layout while others use the generic layout.


