# Feature Ledger: Ligtas-Larga

This document serves as the master record of all planned, implemented, and salvaged features for the Ligtas-Larga project, detailing their functionalities and development statuses.

---

## 1. Implemented Features

### 🗺️ Interactive Google Map Canvas
* **Status:** Implemented (Updated)
* **Description:** Renders a desaturated style map canvas with support for dynamic Dark/Light mode thematic toggling, custom SVG hazard pins, custom origin/destination markers, active polylines representing directions, and a floating control button to show/hide default Google Map POI/base map icons (default view is set to hidden).
* **Component:** [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx), [useHazardMarkers.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useHazardMarkers.ts), [useRouteCalculator.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useRouteCalculator.ts)

### 📈 Dynamic Hazard Marker Stacking (Z-Index Layering)
* **Status:** Implemented
* **Description:** Introduces a dynamic `zIndex` system for hazard markers. Hovered markers and their tooltips are temporarily elevated to the absolute top layer (`highestZIndex + 100`), while permanently clicked/selected markers and InfoWindows are stacked sequentially in order of selection (`highestZIndex++`), preventing overlapping markers from blocking each other's details.
* **Component:** [useHazardMarkers.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useHazardMarkers.ts)

### 🧹 Map Subcontroller Modularization (Debloat)
* **Status:** Implemented
* **Description:** Refactored the core maps file from over 1200 lines to under 325 lines. Shifted complex layout rendering to `ActiveRoutePanel` and extracted core maps logic into modular, reusable hooks (`useHazardMarkers`, `useRouteCalculator`).
* **Files:** [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx), [ActiveRoutePanel.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/ActiveRoutePanel.tsx), [useHazardMarkers.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useHazardMarkers.ts), [useRouteCalculator.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useRouteCalculator.ts)

### 🌊 Fullscreen Liquid Progress Splash Loader
* **Status:** Salvaged (Updated)
* **Description:** A fullscreen splash welcome loader that runs during initial state hydration. Features an animated fluid gradient background, a walking commuter SVG sprite, a bouncing destination marker, and transition effects.
* **Component:** [SplashLoader.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/SplashLoader.tsx)

### ✍️ Autocomplete Location Picker
* **Status:** Implemented (Updated)
* **Description:** Initial overlay that gathers the route start and end positions. Integrates with the Google Places Autocomplete API to suggest addresses, fetch latitude/longitude coordinates, and center the map viewport.
* **Component:** [LocationPicker.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/LocationPicker.tsx)

### 🎛️ Commuter Profile Selector Drawer
* **Status:** Implemented
* **Description:** A drawer containing toggle controls for independent travel modifiers:
  * **Wheelchair Access Mode:** Modifies routes to bypass severe physical blockages like broken ramps or pathways.
  * **Rain Bypass Mode:** Reroutes to avoid flood-prone zones.
  * **Shaded Area Mode:** Reroutes to optimize paths with solar shade.
* **Component:** [ProfileDrawer.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/ProfileDrawer.tsx)

### 🔊 Voice Directions Synthesizer
* **Status:** Implemented (Updated)
* **Description:** Utilizes the Web Speech Synthesis API to read turn-by-turn navigation steps out loud to the commuter, enhancing accessibility.
* **Component:** [useRouteCalculator.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useRouteCalculator.ts)

### 📋 High-Contrast Turn-by-Turn Directions Card
* **Status:** Implemented (Updated)
* **Description:** A pagination card that displays immediate navigation maneuvers, distances, walking path surface materials, and danger notifications.
* **Component:** [ImmediateActionCard.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/ImmediateActionCard.tsx)

### 📝 Crowdsourced Hazard Reporting Form
* **Status:** Implemented
* **Description:** A user interface modal to report on-street hazards. Commuters can select categories, type descriptions, drop a coordinate pin on the map, and upload a verification photo.
* **Component:** [HazardModal.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/HazardModal.tsx)

### 👁️ Hugging Face AI Image Verification
* **Status:** Implemented
* **Description:** An API endpoint that passes user-reported hazard images to a hosted Hugging Face Inference image classification model. Confirms details like "flooding" or "pathway blockages" before setting the validation flag.
* **Route:** `/app/api/vision/route.ts`

### 🛠️ Centralized Maps Utilities Library
* **Status:** Implemented (Updated)
* **Description:** Centralized utility wrapper holding mathematical coordinate calculations, map loaders, light/dark map theme styles, and duration formatting helpers to reduce file bloat.
* **File:** [maps-utils.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/lib/maps-utils.ts)
# Feature Ledger: Ligtas-Larga

This document serves as the master record of all planned, implemented, and salvaged features for the Ligtas-Larga project, detailing their functionalities and development statuses.

---

## 1. Implemented Features

### 🗺️ Interactive Google Map Canvas
* **Status:** Implemented (Updated)
* **Description:** Renders a desaturated style map canvas with support for dynamic Dark/Light mode thematic toggling, custom SVG hazard pins, custom origin/destination markers, active polylines representing directions, and a floating control button to show/hide default Google Map POI/base map icons (default view is set to hidden).
* **Component:** [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx), [useHazardMarkers.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useHazardMarkers.ts), [useRouteCalculator.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useRouteCalculator.ts)

### 📈 Dynamic Hazard Marker Stacking (Z-Index Layering)
* **Status:** Implemented
* **Description:** Introduces a dynamic `zIndex` system for hazard markers. Hovered markers and their tooltips are temporarily elevated to the absolute top layer (`highestZIndex + 100`), while permanently clicked/selected markers and InfoWindows are stacked sequentially in order of selection (`highestZIndex++`), preventing overlapping markers from blocking each other's details.
* **Component:** [useHazardMarkers.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useHazardMarkers.ts)

### 🧹 Map Subcontroller Modularization (Debloat)
* **Status:** Implemented
* **Description:** Refactored the core maps file from over 1200 lines to under 325 lines. Shifted complex layout rendering to `ActiveRoutePanel` and extracted core maps logic into modular, reusable hooks (`useHazardMarkers`, `useRouteCalculator`).
* **Files:** [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx), [ActiveRoutePanel.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/ActiveRoutePanel.tsx), [useHazardMarkers.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useHazardMarkers.ts), [useRouteCalculator.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useRouteCalculator.ts)

### 🌊 Fullscreen Liquid Progress Splash Loader
* **Status:** Salvaged (Updated)
* **Description:** A fullscreen splash welcome loader that runs during initial state hydration. Features an animated fluid gradient background, a walking commuter SVG sprite, a bouncing destination marker, and transition effects.
* **Component:** [SplashLoader.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/SplashLoader.tsx)

### ✍️ Autocomplete Location Picker
* **Status:** Implemented (Updated)
* **Description:** Initial overlay that gathers the route start and end positions. Integrates with the Google Places Autocomplete API to suggest addresses, fetch latitude/longitude coordinates, and center the map viewport.
* **Component:** [LocationPicker.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/LocationPicker.tsx)

### 🎛️ Commuter Profile Selector Drawer
* **Status:** Implemented
* **Description:** A drawer containing toggle controls for independent travel modifiers:
  * **Wheelchair Access Mode:** Modifies routes to bypass severe physical blockages like broken ramps or pathways.
  * **Rain Bypass Mode:** Reroutes to avoid flood-prone zones.
  * **Shaded Area Mode:** Reroutes to optimize paths with solar shade.
* **Component:** [ProfileDrawer.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/ProfileDrawer.tsx)

### 🔊 Voice Directions Synthesizer
* **Status:** Implemented (Updated)
* **Description:** Utilizes the Web Speech Synthesis API to read turn-by-turn navigation steps out loud to the commuter, enhancing accessibility.
* **Component:** [useRouteCalculator.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/components/useRouteCalculator.ts)

### 📋 High-Contrast Turn-by-Turn Directions Card
* **Status:** Implemented (Updated)
* **Description:** A pagination card that displays immediate navigation maneuvers, distances, walking path surface materials, and danger notifications.
* **Component:** [ImmediateActionCard.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/ImmediateActionCard.tsx)

### 📝 Crowdsourced Hazard Reporting Form
* **Status:** Implemented
* **Description:** A user interface modal to report on-street hazards. Commuters can select categories, type descriptions, drop a coordinate pin on the map, and upload a verification photo.
* **Component:** [HazardModal.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/HazardModal.tsx)

### 👁️ Hugging Face AI Image Verification
* **Status:** Implemented
* **Description:** An API endpoint that passes user-reported hazard images to a hosted Hugging Face Inference image classification model. Confirms details like "flooding" or "pathway blockages" before setting the validation flag.
* **Route:** `/app/api/vision/route.ts`

### 🛠️ Centralized Maps Utilities Library
* **Status:** Implemented (Updated)
* **Description:** Centralized utility wrapper holding mathematical coordinate calculations, map loaders, light/dark map theme styles, and duration formatting helpers to reduce file bloat.
* **File:** [maps-utils.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/lib/maps-utils.ts)

### 🔒 Role-Based Session Management (Admin & Anonymous)
* **Status:** Implemented
* **Description:** Introduces distinct user sessions with Supabase Auth:
  * **Anonymous Session:** Public users can query routes, view active hazards, and submit new reports (queued for review, marked `isValidated = false` or verified).
  * **Registered User Session:** Commuters can log in to submit verified reports.
  * **Administrator Session:** Secure role-restricted partition (`/admin` layouts) allowing admins to review the verification queue, edit details, approve pending crowdsourced hazard reports, or manually add/remove hazards.
* **Vercel Applicability:** Unified app routing structure (Next.js Proxy/Middleware + Role cookie validation) deployed as a single project on Vercel.
* **Files:** [proxy.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/proxy.ts), [admin/page.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/app/admin/page.tsx), [login/page.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/app/login/page.tsx), [/api/auth/*](file:///C:/AI-Integrated-Coding/SPARKFEST/app/api/auth), [/api/admin/*](file:///C:/AI-Integrated-Coding/SPARKFEST/app/api/admin)

### ⭐ Saved Places Personalization
* **Status:** Implemented
* **Description:** Allows authenticated users to save specific coordinates with custom labels (e.g. *Home*, *School*). Supports case-sensitive duplicate checks to prevent duplicate naming while permitting variations (e.g. "Home" duplicate blocked, but "HOME" allowed). Features quick-action buttons to instantly populate the routing fields.
* **Route & Component:** [LocationPicker.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/LocationPicker.tsx), [/api/saved-places](file:///C:/AI-Integrated-Coding/SPARKFEST/app/api/saved-places/route.ts)

### 🛣️ Saved Routes Personalization
* **Status:** Implemented
* **Description:** Enables authenticated users to save calculated safe routes including the specific origin, destination, and selected travel profile modifiers (Wheelchair/Shaded/Rain). Clicking a saved route instantly restores the filters and recalculates the path.
* **Route & Component:** [ActiveRoutePanel.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/ActiveRoutePanel.tsx), [LocationPicker.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/LocationPicker.tsx), [/api/saved-routes](file:///C:/AI-Integrated-Coding/SPARKFEST/app/api/saved-routes/route.ts)

### 👤 Commuter Profile Dashboard
* **Status:** Implemented
* **Description:** Introduces a dedicated, glassmorphic overlay panel inside the left sidebar. Displays account details, handles saved place management (populating inputs or deleting records), lists saved routes, and handles user account removal.
* **Component:** [UserProfileDashboard.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/UserProfileDashboard.tsx), [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx), [BrandHeader.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/BrandHeader.tsx)

### ⚠️ Permanent Account Deletion
* **Status:** Implemented
* **Description:** Provides a secure account deletion trigger. Deletes the `UserProfile` record from the Postgres database (triggering a cascade-delete of saved places and routes), executes raw PostgreSQL superuser SQL to delete from Supabase Auth (`auth.users`), deletes the session cookie, and returns the client to the planner.
* **Route & Component:** [UserProfileDashboard.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/UserProfileDashboard.tsx), [/api/auth/me](file:///C:/AI-Integrated-Coding/SPARKFEST/app/api/auth/me/route.ts)

### ✨ Custom Glassmorphic Toast & Confirmation Dialogs
* **Status:** Implemented
* **Description:** Replaces native browser alert popups and confirm boxes with responsive, floating glassmorphic toast notification cards and custom confirmation modal cards, enhancing visual styling and dark-mode compatibility.
* **Component:** [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx), [LocationPicker.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/LocationPicker.tsx), [UserProfileDashboard.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/UserProfileDashboard.tsx)

### 📍 Admin Direct Map Placement
* **Status:** Implemented
* **Description:** Empowers logged-in administrators to toggle a direct pinning mode (using a custom `🔨` button in the floating map controls which turns into a red `✕` when active). When active, a red status banner displays at the top center of the screen with an "Exit" button. Clicking anywhere on the Map canvas during this mode automatically launches the hazard reporting form prefilled with the clicked coordinates. Closing the modal (either via submission or cancellation) automatically exits the pinning mode. Admins can skip attaching photos, and submissions are instantly approved and validated (`isValidated = true`) on the public map.
* **Component:** [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx), [HazardModal.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/HazardModal.tsx), [MapControls.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/MapControls.tsx)

---

## 2. Planned Features
