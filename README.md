# 🗺️ Ligtas-Larga

Ligtas-Larga is a mobile-first, crowdsourced mapping and navigation web application. It is designed to assist urban commuters, students, and vulnerable sectors in Metro Manila in identifying, reporting, and bypassing accessibility hazards and environmental issues in real-time.

---

## 🎯 Project Aim
The core aim of Ligtas-Larga is to democratize city accessibility. By providing dynamic routing that actively avoids physical barriers, weather hazards, and construction obstacles, the platform ensures that commuters of all ability levels can navigate Metro Manila safely, predictably, and with absolute confidence.

---

## 🔍 Project Overview & Core Feature Pillars
Rather than presenting a simple list of features, Ligtas-Larga's features are organized into four core functional pillars:

1. **Interactive Accessibility Navigation:** An custom desaturated map canvas with dynamic Dark/Light modes. Commuters can toggle route modifiers (Wheelchair access, Rain bypass, Solar shade) and receive turn-by-turn maneuvers (with optional voice synthesis) and precise transit/bus/jeep fare estimates based on local matrix data.
2. **AI-Validated Hazard Reporting:** A user-friendly modal to report active road hazards. Image uploads are verified on submission using **Hugging Face image classification models** to filter out spam before pins are published.
3. **Personalized Commuter Dashboard:** A left-hand sidebar mini-dashboard enabling logged-in users to manage credentials, perform account deletion, and save frequent coordinates (places) and safe navigation paths (routes) for quick access.
4. **Admin Queue & Direct Pinning:** A role-restricted admin portal (`/admin`) to approve, edit, delete, or override hazard pins (including configuring custom expiration times). Includes a click-to-pin tool allowing admins to manually log verified hazards without uploading photos.

---

## 🤖 AI Validation & Future IoT Integration

### 🧠 Hugging Face AI Validation
To prevent spam, Ligtas-Larga integrates the **Hugging Face Inference API** directly into the crowdsourced reporting workflow. When a user submits an image of a hazard (such as a flood), the server verifies the classification labels from the AI model before allowing the hazard pin to be displayed on the map.

### 🌐 Future IoT Integration
While currently relying on crowdsourced reports, Ligtas-Larga is built with an **IoT-ready data architecture**. In the future, municipal sensors, water-level meters, and smart city cameras can connect directly to the API. This integration will enable the system to automatically update and resolve hazards in real-time, ensuring optimal path safety with minimal manual intervention.

---

## 🛠️ Technology Stack

### Core Technologies:
* **Framework:** Next.js 16 (App Router) & TypeScript
* **Database & Auth:** Supabase PostgreSQL (via Prisma ORM v7) & Supabase Auth
* **Styling:** Custom Vanilla CSS (glassmorphism & dark/light theme variables)

### Google Maps Technologies:
* **Maps JS SDK:** Renders the map canvas and overlays.
* **Routes API:** Computes route geometry and directions.
* **Places Autocomplete Service & Geocoder:** Enables address searches and place ID lookups.

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
