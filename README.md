# 🗺️ Ligtas-Larga

Ligtas-Larga is a mobile-first, crowdsourced mapping and navigation web application. It is designed to assist urban commuters, students, and vulnerable sectors in Metro Manila (e.g. wheelchair users) in identifying, reporting, and bypassing accessibility hazards and environmental issues in real-time.

---

## 🎯 Project Aim & Overview
Ligtas-Larga aims to democratize city accessibility. By calculating routes that actively avoid physical barriers, weather hazards, and sidewalk blockages, the platform ensures all commuters can navigate Metro Manila safely and predictably.

---

## 🛠️ Complete Feature Set

Here is the exact index of features currently implemented in the application:

* **Interactive Google Map Canvas:** Desaturated maps layout with custom SVG pins, responsive polyline paths, and options to hide base map POIs. Restricted to the Philippines bounds with a minimum zoom limit.
* **Dynamic Hazard Marker Stacking (Z-Indices):** Hovered markers and tooltips temporarily elevate to the top layer (`highestZIndex + 100`) while clicked/selected markers stack sequentially in selection order.
* **Map Subcontroller Modularization:** Extracted complex overlays and directions calculators into distinct React hooks (`useHazardMarkers`, `useRouteCalculator`) and standalone components.
* **Liquid Progress Splash Loader:** Fullscreen gradient loading screen featuring a walking commuter SVG sprite and bouncing markers running during initial app hydration.
* **Autocomplete Location Picker:** Search boxes for origin and destination integrating classic `AutocompleteService` predictions and Geocoder Place ID coordinate lookups, restricted to the Philippines.
* **Commuter Profile Selector Drawer:** Toggle controls for independent travel profiles:
  * *Wheelchair Access Mode:* Bypasses severe physical blockages like broken ramps or stairs.
  * *Rain Bypass Mode:* Reroutes to avoid flood-prone zones.
  * *Shaded Area Mode:* Bypasses unsheltered pathways to reduce solar exposure.
* **Voice Directions Synthesizer:** Integrates the Web Speech Synthesis API to read turn-by-turn maneuvers out loud to the commuter.
* **High-Contrast Directions Card:** Pagination widget rendering Commute Turn-by-Turn cards (with teal borders and boarding markers) or Generic Turn-by-Turn cards depending on mode.
* **Smart Hazard Reporting Form:** Modal interface allowing users to categorize, describe, drop pins, and upload a verification photo of street obstacles.
* **Hugging Face AI Image Verification:** Validates crowdsourced hazard photos using a hosted image classification model before public markers are published.
* **Centralized Maps Utilities:** Contains mathematical Haversine calculations, map loaders, theme styles, and formatters to reduce codebase footprint.
* **Role-Based Session Management:** Integrates cookie-based sessions with Supabase Auth:
  * *Anonymous Session:* Users can query routes, view active pins, and queue reports for review.
  * *User Session:* Logged-in commuters can submit instantly verified reports.
  * *Admin Session:* Role-restricted admin interface (`/admin`) for review queues.
* **Saved Places Personalization:** Allows logged-in users to save coordinates with custom labels (e.g. *Home*) with case-sensitive duplicate checking.
* **Saved Routes Personalization:** Enables users to save calculated safe routes (retaining origin, destination, and selected accessibility modifiers).
* **Commuter Profile Dashboard:** Sidebar panel displaying account stats, allowing place shortcut creation, route calculation, and account deletion.
* **Permanent Account Deletion:** Permanent deletion of user profiles, saved places/routes, and credentials from Supabase Auth.
* **Glassmorphic Toast & Confirmation Dialogs:** Custom React overlays replacing browser dialogs (`alert()`, `confirm()`) globally.
* **Admin Direct Map Placement:** Click-to-pin mode for admins to drop coordinates on the map canvas, bypassing photo requirements and instantly publishing verified hazard markers.
* **Commute, Bicycle, Motorcycle, & Car Modes:** Fare calculator using local matrices for LRT-1, LRT-2, MRT-3, PNR, jeepneys, and buses, supporting discounted rates. Falls back to drive paths if transit is unavailable.
* **Expiring Hazard Timers:** Default 2-hour expiration window for temporary hazards (like flood reports). Popups show a live countdown timer ticking down to the second in real-time.

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
