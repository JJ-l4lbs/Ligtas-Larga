# 🗺️ Ligtas-Larga

Ligtas-Larga is a mobile-first, crowdsourced mapping and navigation web application. It is designed to assist urban commuters, students, and vulnerable sectors in Metro Manila (e.g. wheelchair users) in identifying, reporting, and bypassing accessibility hazards and environmental issues in real-time.

---

## 🎯 Project Aim & Overview
Ligtas-Larga aims to democratize city accessibility. By calculating routes that actively avoid physical barriers, weather hazards, and sidewalk blockages, the platform ensures all commuters can navigate Metro Manila safely and predictably.

---

## 🛠️ Implemented Features (Index from Features.md)

* **🗺️ Interactive Google Map Canvas:** Renders a desaturated style map canvas with support for dynamic Dark/Light mode thematic toggling, custom SVG hazard pins, custom origin/destination markers, active polylines representing directions, and a floating control button to show/hide default Google Map POI/base map icons. Viewport is restricted strictly to the Philippines bounds with a minimum zoom limit.
* **📈 Dynamic Hazard Marker Stacking (Z-Index Layering):** Introduces a dynamic `zIndex` system for hazard markers. Hovered markers and their tooltips are temporarily elevated to the absolute top layer (`highestZIndex + 100`), while permanently clicked/selected markers and InfoWindows are stacked sequentially in order of selection.
* **🧹 Map Subcontroller Modularization (Debloat):** Shifted complex layout rendering to `ActiveRoutePanel` and extracted core maps logic into modular, reusable hooks (`useHazardMarkers`, `useRouteCalculator`) to maintain a clean codebase.
* **🌊 Fullscreen Liquid Progress Splash Loader:** A fullscreen splash welcome loader that runs during initial state hydration. Features an animated fluid gradient background, a walking commuter SVG sprite, a bouncing destination marker, and transition effects.
* **✍️ Autocomplete Location Picker:** Search fields integrating with classic `AutocompleteService` predictions and Geocoder `placeId` queries, restricted/biased strictly to the Philippines to suggest local addresses, fetch coordinates, and center the map viewport.
* **🎛️ Commuter Profile Selector Drawer:** A drawer containing toggle controls for independent travel modifiers:
  * *Wheelchair Access Mode:* Modifies routes to bypass severe physical blockages like broken ramps or pathways.
  * *Rain Bypass Mode:* Reroutes to avoid flood-prone zones.
  * *Shaded Area Mode:* Reroutes to optimize paths with solar shade.
* **🔊 Voice Directions Synthesizer:** Utilizes the Web Speech Synthesis API to read turn-by-turn navigation steps out loud to the commuter, enhancing accessibility.
* **📋 High-Contrast Turn-by-Turn Directions Card:** Displays immediate navigation maneuvers with custom layouts: a Commute Card (with teal borders, segment fare badges, and boarding stops) when a commute fare is present, and a Generic Card for other segments.
* **📝 Crowdsourced Hazard Reporting Form:** A user interface modal to report on-street hazards. Commuters can select categories, type descriptions, drop a coordinate pin on the map, and upload a verification photo.
* **👁️ Hugging Face AI Image Verification:** An API endpoint that passes user-reported hazard images to a hosted Hugging Face Inference image classification model. Confirms details like "flooding" or "pathway blockages" before setting the validation flag.
* **🛠️ Centralized Maps Utilities Library:** Centralized utility wrapper holding mathematical coordinate calculations, map loaders, light/dark map theme styles, and duration formatting helpers to reduce file bloat.
* **🔒 Role-Based Session Management (Admin & Anonymous):** Introduces distinct user sessions with Supabase Auth:
  * *Anonymous Session:* Public users can query routes, view active hazards, and queue submissions.
  * *Registered User Session:* Commuters can log in to submit instantly verified reports.
  * *Administrator Session:* Secure role-restricted partition (`/admin` layout) allowing admins to review queues, edit details, or delete/verify reports.
  * *Session Termination (Logout):* Logouts reload the application and redirect to the root URL.
* **⭐ Saved Places Personalization:** Allows authenticated users to save specific coordinates with custom labels (e.g. *Home*, *School*). Supports case-sensitive duplicate checks to prevent duplicate naming while permitting variations.
* **🛣️ Saved Routes Personalization:** Enables authenticated users to save calculated safe routes (including origin, destination, and selected travel profile modifiers).
* **👤 Commuter Profile Dashboard:** A dedicated, glassmorphic overlay panel inside the left sidebar. Displays account details, handles saved place management, lists saved routes, and handles user account removal.
* **⚠️ Permanent Account Deletion:** Deletes the `UserProfile` record from the database (triggering a cascade-delete of saved places and routes), executes raw SQL to delete the user credentials from Supabase Auth, and clears session cookies.
* **✨ Custom Glassmorphic Toast & Confirmation Dialogs:** Replaces native browser alert popups and confirm boxes with responsive, floating glassmorphic toast cards and custom confirmation modals globally.
* **📍 Admin Direct Map Placement:** Click-to-pin mode for admins to drop coordinates on the map canvas, bypassing photo requirements and instantly publishing verified hazard markers.
* **🚌 Commute, Bicycle, Motorcycle, & Car Modes (Transit Fare Calculator):** Calculates transit leg fares dynamically using local CSV databases for LRT-1, LRT-2, MRT-3, PNR, jeepneys, and buses. Supports discounted rates and falls back to driving paths if transit is unavailable.
* **⏱️ Expiring Hazard Timers (Flooded Hazards):** Default 2-hour expiration window for temporary hazards (like flood reports). Popups show a live countdown timer ticking down to the second in real-time.

---

## 🤖 AI Validation & IoT Integration

* **AI Image Validation:** Powered by **Hugging Face Inference API** to analyze image content and verify reports against spam.
* **IoT-Ready Architecture:** Built with open hooks to support future integration of municipal IoT road sensors, water level meters, and smart cameras to automate hazard logging and deletion in real-time.

---

## 🛠️ Technology Stack

* **Core Framework:** Next.js 16 (App Router), TypeScript, Prisma ORM (v7).
* **Database & Auth:** Supabase PostgreSQL & Supabase Auth.
* **Styling:** Custom Vanilla CSS.
* **Google APIs:** Maps JS SDK, Routes API, Places Autocomplete Service, Geocoder.

---

## 👥 Development Team
* **Jarren Irvine F. Duron**
* **Ma. Victoria C. Narte**
* **Precious Marian V. Cruz**
* **Geane Alexandra M. Remolacio**

---

## 🚀 Localhost Run Instructions

1. **Clone & Install:**
   ```bash
   git clone https://github.com/JJ-l4lbs/Ligtas-Larga.git
   npm install
   ```
2. **Environment Variables:** Create a `.env.local` file with:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `HUGGING_FACE_API_KEY`
   - `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Database Sync & Seed:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed-test
   ```
4. **Run Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
