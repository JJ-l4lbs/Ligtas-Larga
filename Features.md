# Feature Ledger: Ligtas-Larga

This document serves as the master record of all planned, implemented, and salvaged features for the Ligtas-Larga project, detailing their functionalities and development statuses.

---

## 1. Implemented Features

### 🗺️ Interactive Google Map Canvas
* **Status:** Implemented (Updated)
* **Description:** Renders a desaturated style map canvas with support for dynamic Dark/Light mode thematic toggling. It displays custom SVG hazard pins, custom origin/destination markers, and active polylines representing directions.
* **Component:** [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx)

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
* **Status:** Implemented
* **Description:** Utilizes the Web Speech Synthesis API to read turn-by-turn navigation steps out loud to the commuter, enhancing accessibility.
* **Component:** [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx)

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

---

## 2. Planned Features

### 🔒 Role-Based Session Management (Admin & Anonymous)
* **Status:** Planned
* **Description:** Introduces distinct user sessions with Supabase Auth:
  * **Anonymous Session:** Public users can query routes, view active hazards, and submit new reports (queued for review, marked `isValidated = false`).
  * **Registered User Session:** Commuters can log in to submit verified reports and save favorite locations/routes.
  * **Administrator Session:** Secure role-restricted partition (`/admin` layouts) allowing admins to review the verification queue, edit details, approve pending crowdsourced hazard reports, or manually add hazards.
* **Vercel Applicability:** Unified app routing structure (Next.js Middleware + Role cookie validation) deployed as a single project on Vercel.
