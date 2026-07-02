# 🗺️ Ligtas-Larga

Ligtas-Larga is a mobile-first, crowdsourced mapping and navigation web application. It is designed to assist urban commuters, students, and vulnerable sectors in Metro Manila in identifying, reporting, and bypassing accessibility hazards and environmental issues in real-time.

---

## 🎯 Project Aim
The core aim of Ligtas-Larga is to democratize city accessibility. By providing dynamic routing that actively avoids physical barriers, weather hazards, and construction obstacles, the platform ensures that commuters of all ability levels can navigate Metro Manila safely, predictably, and with absolute confidence.

---

## 🔍 Project Overview
Ligtas-Larga bridges the gap between static map data and dynamic city realities. Through real-time crowdsourcing, the application maps temporary and permanent hazards (like flooded streets, broken elevators, or blocked ramps) and computes alternative, barrier-free routes tailored to specific commuter needs. It integrates modern Web APIs, AI models, and local transit data to deliver a seamless navigation assistant built from the ground up for mobile devices.

---

## 🛠️ Complete Feature Index (Detailed & Explained)

Ligtas-Larga implements the following features, fully integrated to support safe navigation and reporting:

### 1. 🗺️ Interactive Google Map Canvas
* **Description:** Renders a customized, desaturated map style. Supports dynamic Dark and Light mode theme changes. Origin and destination coordinates are highlighted with unique custom markers, and active directions paths are rendered with responsive polylines. Includes a floating toggle button to show or hide default Google Maps points of interest (POIs) to reduce visual clutter.
* **Geographic Restraint:** The viewport bounds are locked to the Philippines (4.6°N to 21.2°N, 116.6°E to 126.6°E) with `minZoom: 5` to prevent zooming out past the country's boundaries.

### 2. ⏱️ Expiring Hazard Timers (Flooded Hazards)
* **Description:** Implements live, dynamic countdown timers for temporary street hazards (like flooding). Default reports expire after 2 hours. The remaining time is rendered on open map pin InfoWindows, updating once per second to show when the hazard is expected to clear. Admins can view and adjust this expiration time using a calendar datetime picker in the review queue.

### 3. 📈 Dynamic Hazard Marker Stacking (Z-Index Layering)
* **Description:** Avoids overlapping pin issues by managing marker layering. Whenever a commuter hovers over a pin, the marker and its tooltip instantly elevate to the topmost layer (`highestZIndex + 100`). Selected or clicked pins stack sequentially based on selection order (`highestZIndex++`), ensuring active InfoWindows remain readable and are not blocked by neighboring pins.

### 4. 🧹 Map Subcontroller Modularization (Debloat)
* **Description:** Extracted all complex routing, scripting, and marker rendering out of the core map component and modularized them into specialized React hooks (`useHazardMarkers`, `useRouteCalculator`) and separate subcomponents (like `ActiveRoutePanel`). This design pattern reduced the main map file footprint to under 325 lines, making maintenance highly efficient.

### 🌊 Fullscreen Liquid Progress Splash Loader
* **Description:** Runs during the initial hydration of the application's states. Displays a custom fluid-liquid gradient transition background, a bouncing destination pin, and an animated walking commuter SVG sprite, hiding behind-the-scenes layout adjustments until the page is fully ready.

### 5. ✍️ Autocomplete Location Picker
* **Description:** The entry interface for planning routes. Integrates the classic Google Places `AutocompleteService` to fetch search suggestions and the Google Geocoder API using `placeId` queries. The suggestions are biased and restricted strictly to the Philippines to ensure local search relevance while avoiding complex dynamic library warning errors.

### 6. 🎛️ Commuter Profile Selector Drawer
* **Description:** A drawer containing toggle controls for independent travel modifiers:
  * **Wheelchair Access Mode:** Modifies routes to bypass severe physical blockages like broken ramps or pathways.
  * **Rain Bypass Mode:** Reroutes to avoid flood-prone zones.
  * **Shaded Area Mode:** Reroutes to optimize paths with solar shade.

### 7. 🔊 Voice Directions Synthesizer
* **Description:** Employs the native Web Speech Synthesis API to read turn-by-turn maneuvers aloud as the commuter walks or rides. Provides an option to toggle voice output on or off within the panel, ensuring hands-free accessibility.

### 8. 📋 High-Contrast Turn-by-Turn Directions Card
* **Description:** Displays maneuvers at the bottom of the navigation view. Features a split layout approach:
  * **Commute Card:** Indicated by teal borders, segment fare badges, and boarding/alighting stops.
  * **Generic Card:** Renders classic direction arrows with a step index indicator for walking, driving, or cycling segments.

### 9. 📝 Crowdsourced Hazard Reporting Form
* **Description:** A user-friendly popup form to submit on-street accessibility blockages. Commuters select a category (e.g. Flood, Broken Elevator, Blocked Ramp), type a description, drop a precise marker pin, and upload a verification photo taken from their camera.

### 10. 👁️ Hugging Face AI Image Verification
* **Description:** Sends uploaded images from commuter hazard reports to a hosted Hugging Face image classification model. The server validates that the image matches the reported category (like validating "water/flooding" tags) before setting the validation flag, filtering out spam automatically.

### 11. 🛠️ Centralized Maps Utilities Library
* **Description:** Serves as the single repository for all coordinate mathematics (such as Haversine distances to calculate proximity to hazards), script loaders, map styling themes, and time duration formatting helpers.

### 12. 🔒 Role-Based Session Management (Admin & Anonymous)
* **Description:** Secures paths and endpoints using Next.js and Supabase cookie validation:
  * **Anonymous Session:** Allows standard route calculation, active hazard views, and queued report submissions.
  * **Registered User Session:** Allows direct posting of verified reports.
  * **Administrator Session:** Protects the `/admin` workspace where administrators verify, approve, edit, or delete pins. Logouts clear cookies and redirect users back to the splash loader.

### 13. ⭐ Saved Places Personalization
* **Description:** Authenticated users can save locations with custom labels (e.g., "Home"). Includes a case-sensitive duplicate check, blocking exact matches to keep data clean while allowing natural naming modifications. Includes quick-populate buttons to instantly set route coordinates.

### 14. 🛣️ Saved Routes Personalization
* **Description:** Enables authenticated users to save calculated safe routes including the specific origin, destination, and selected travel profile modifiers (Wheelchair/Shaded/Rain). Clicking a saved route automatically populates coordinates and recalculates the path.

### 15. 👤 Commuter Profile Dashboard
* **Description:** A slide-out panel that manages user account statistics, lists saved place shortcuts, displays saved routes, and houses the account termination button.

### 16. ⚠️ Permanent Account Deletion
* **Description:** Allows users to remove their profile. A single action cascade-deletes their user record, saved places, and saved routes from the PostgreSQL database, executes a secure query to delete credentials from Supabase Auth (`auth.users`), clears cookies, and redirects the client to the planner.

### 17. ✨ Custom Glassmorphic Toast & Confirmation Dialogs
* **Description:** Replaces native browser alert and confirm popups with custom floating toast overlays and glassmorphic modal blocks. This ensures a consistent style matching the overall dark/light design system.

### 18. 📍 Admin Direct Map Placement
* **Description:** A click-to-pin mapping state for administrators. Clicking anywhere on the map during this mode opens the hazard submission form prefilled with the clicked coordinates. Admins can skip image uploads, and markers are instantly posted as validated pins on the map.

### 19. 🚌 Commute, Bicycle, Motorcycle, & Car Modes (Transit Fare Calculator)
* **Description:** Calculates routes for multiple vehicle types. In Commute mode, it requests transit segments from Google (rail, subway, bus, tram) and queries local CSV database matrices (LRT-1, LRT-2, MRT-3, PNR, jeepneys, buses) to compute the exact travel fare (with toggles for regular or discounted rates). If transit is unavailable, it uses a driving fallback with distance-based jeepney fare estimation.

### 20. 📍 Real-Time Location Tracking
* **Description:** Actively tracks and shows the commuter's current position on the map canvas. It displays a blue dot user-location marker, updates calculations for hazard proximity alerts, prompts dynamic voice navigation updates as the user moves, and automatically handles cleaning up the watcher references when components are closed.

---

## 🤖 AI Verification & Future IoT Integration

### 🧠 Hugging Face AI Validation
To prevent spam, Ligtas-Larga integrates the **Hugging Face Inference API** directly into the crowdsourced reporting workflow. When a user submits an image of a hazard, the server verifies the classification labels from the AI model before allowing the hazard pin to be displayed on the map.

### 🌐 Future IoT Integration
While currently relying on crowdsourced reports, Ligtas-Larga is built with an **IoT-ready data architecture**. In the future, municipal sensors, water-level meters, and smart city cameras can connect directly to the API. This integration will enable the system to automatically update and resolve hazards in real-time, ensuring optimal path safety with minimal manual intervention.

---

## 🛠️ Technology Stack (Under-the-Hood Specifications)

### 1. Application Architecture & Hydration
* **Next.js 16 (App Router):** Leverages React Server Components (RSC) for initial page fetching, combined with Client Component trees (`"use client"`) for dynamic dashboard modules.
* **React 19:** Uses state hooks (`useState`, `useRef`, `useEffect`, `useCallback`, `useMemo`) to handle viewport updates, marker arrays, search suggestion throttling, and dark/light mode context themes.
* **Dynamic Imports:** Wraps maps and geocoding components in dynamic hooks with `{ ssr: false }` to prevent server-side Node.js rendering of browser-only `window` and `document` properties, avoiding compilation mismatches.
* **Next.js Route Handlers:** RESTful serverless routing endpoints (located under `app/api/*/route.ts`) parsing incoming JSON POST requests and URL query string filters.

### 2. Database & Data Persistance
* **Prisma ORM (v7.8.0):** Type-safe database interface supporting automated schema generation. Models include:
  * `UserProfile` (IDs, emails, roles, timestamps).
  * `HazardReport` (coordinates, descriptions, category types, verification files, validation flags, custom expiration timestamps).
  * `SavedPlace` & `SavedRoute` (user bookmarks mapped to coordinates and routing states).
* **Supabase PostgreSQL Database:** Hosting provider supporting transaction pooling (port `6543` / `DATABASE_URL` for backend queries) and direct migration mapping (port `5432` / `DIRECT_URL` for Prisma pushes).

### 3. User Authentication & Session Security
* **Supabase Auth Client (`@supabase/supabase-js`):** Signs, issues, and validates JWT user session signatures.
* **Next.js Edge Proxy Gateways (`proxy.ts`):** Edge-safe routing controller validating the `sb-access-token` session cookie. Admin routes check roles using Supabase REST endpoints (`/rest/v1/UserProfile`) before allowing access.
* **Cascade deletion queries:** Raw SQL executes on account removal to safely wipe authentication credentials from Supabase's schemas (`auth.users`) alongside database model records.

### 4. Styling Systems
* **Vanilla CSS Layouts:** Centralized design engine (`app/globals.css`) containing custom HSL variables, fluid typography scales, flex/grid templates, and dark theme CSS styles.
* **Glassmorphic properties:** Employs CSS parameters (`backdrop-filter: blur(12px)`, variables for borders and translucent backdrops) to build responsive, floating user overlays.

---

## 🔌 API & Integration Layer Details

### 1. Google Maps JavaScript SDK
* **Script Injection Engine:** Dynamically injected on the client side using a custom React loader hook targeting the following endpoint:
  `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker,geometry&v=weekly`
* **Advanced Markers (`google.maps.marker.AdvancedMarkerElement`):** Uses Google Maps vector-based markers to bind styled HTML and custom SVG pins to specific latitudes/longitudes, replacing legacy deprecated raster pins.
* **Map Lifecycle Controllers:** Renders the map canvas instance (`new google.maps.Map`) with customized styling variables to hide POI nodes and draw directions polylines.
* **InfoWindows (`google.maps.InfoWindow`):** Populates dynamic HTML countdown elements inside markers using standard DOM mounting points.

### 2. Google Places API (Classic Services)
* **Autocomplete Service (`google.maps.places.AutocompleteService`):** Queries predictions through the classic autocomplete service (`getPlacePredictions`) using a `PH` country boundary restriction. This avoids loading the heavy Places v4 library and keeps API key configurations billing-safe.
* **Geocoder (`google.maps.Geocoder`):** Queries by unique `placeId` parameters via `geocode({ placeId: ... })` to resolve coordinates.

### 3. Google Routes API (v2 directions)
* **HTTP REST POST Client:** Next.js route handlers fetch data directly from the Routes API v2 endpoint:
  `https://routes.googleapis.com/directions/v2:computeRoutes`
* **Custom Field Masking:** Sets `X-Goog-FieldMask` headers to target specific fields:
  `routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.duration,routes.legs.distanceMeters,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration,routes.legs.steps.startLocation,routes.legs.steps.endLocation`
* **Travel Mode Schemas:** Maps requests to corresponding modes: `TRANSIT`, `WALK`, `BICYCLE`, `TWO_WHEELER` (motorcycles), and `DRIVE`.

### 4. HTML5 Geolocation API
* **Current Position Fetcher (`navigator.geolocation.getCurrentPosition`):** Queries the user's high-accuracy hardware coordinates to instantly resolve current locations for the "Locate Me" quick-navigation buttons.
* **Continuous Location Watcher (`navigator.geolocation.watchPosition`):** Sets up a high-accuracy, real-time watcher to continuously stream coordinate changes. Feeds updates directly to the map state hooks and updates dynamic routing directions.
* **Watcher Cleaner (`navigator.geolocation.clearWatch`):** Clears the running hardware watcher ID on component unmounting to prevent memory leaks and optimize mobile battery life.

### 5. Hugging Face Inference API
* **Hugging Face Client (`@huggingface/inference`):** Queries remote models using the Hugging Face SDK.
* **Vision Classification Service:** Forwards on-street report photos to an image classification model. The server checks the labels to verify categories like flooding or construction debris before publishing pins.

### 6. Local Commute & Fares API
* **Fare Engine:** Next.js server utility utilizing local CSV databases mapping train stations (LRT-1, LRT-2, MRT-3, PNR) and PUJ (jeepney)/PUB (bus) routes. 
* **Discount Logic:** Applies Student/Senior/PWD discount rules (e.g. 20% off base fares and per-kilometer additions). Treats trains as accessibility fallbacks by bypassing nearby ramp/elevator blockages.

---

## 👥 Development Team
* **Jarren Irvine F. Duron**
* **Ma. Victoria C. Narte**
* **Precious Marian V. Cruz**
* **Geane Alexandra M. Remolacio**

---

## 🚀 Localhost Setup & Installation

### 1. Install Dependencies
```bash
git clone https://github.com/JJ-l4lbs/Ligtas-Larga.git
cd Ligtas-Larga
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory. This file is required to connect to external services. Ensure the following keys are defined:
* `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
* `HUGGING_FACE_API_KEY`
* `DATABASE_URL` (Supabase pooled connection string)
* `DIRECT_URL` (Supabase direct connection string)
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Sync Database Schema & Seed Data
Generate the Prisma client, apply database migrations, and seed 50 hand-crafted Metro Manila hazards:
```bash
npx prisma generate
npx prisma db push
npm run seed-test
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
