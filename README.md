# 🗺️ Ligtas-Larga

Ligtas-Larga is a mobile-first, crowdsourced mapping and navigation web application. It is designed to assist urban commuters, students, and vulnerable sectors (such as wheelchair users or senior citizens) in identifying, reporting, and bypassing accessibility hazards and environmental issues (such as flooding) in real time across Metro Manila.

---

## 🎯 Project Aim
The core aim of Ligtas-Larga is to democratize city accessibility. By providing dynamic routing that actively avoids physical barriers, weather hazards, and construction obstacles, the platform ensures that commuters of all ability levels can navigate public pathways safely, predictably, and with absolute confidence.

---

## 🔍 Project Overview & Core Features

* **Mobile-First Responsive Layout:** Designed from the ground up prioritizing touch-friendly layouts, fast resource loads, and compact sidebars optimized for mobile viewports.
* **Smart Travel Mode & Fare Engine:** Supports walking, bicycling, motorcycle, driving, and public commute travel profiles. For public commute, it parses local transit databases (LRT-1, LRT-2, MRT-3, PNR, jeepneys, and buses) to calculate exact commuter segment fares, student/senior discounts, and boarding routes.
* **Dynamic Hazard Routing (Avoidance Scoring):** Active hazard layers (e.g., broken elevators, blocked wheelchair ramps, construction blocks, pathway obstacles, and severe flooding) are dynamically cross-referenced during route calculations, directing users to bypass affected segments.
* **Real-Time Expiration Timers:** Temporary hazards (like flood reports) default to a 2-hour expiration window. Popups on the map feature live countdown timers ticking down to the second, indicating when the hazard is estimated to subside.
* **Admin Review Queue & Direct Pinning:** Features a secure admin interface (`/admin`) to verify, edit, delete, or override hazard parameters (including expiration dates) and toggle a direct click-to-pin mapping tool.

---

## 🤖 AI Verification & Future IoT Integration

### 🧠 Hugging Face AI Image Validation
To protect the integrity of the map data from spam or inaccurate reports, Ligtas-Larga utilizes the **Hugging Face Inference API** (running an image classification model). When a commuter snaps a photo of a hazard (e.g. street flooding or construction barriers), the backend forwards the image to the model to confirm that the visual labels match the selected category before publishing the report.

### 🌐 Crowd-Sourced & IoT-Ready Design
While the platform currently relies on active **crowdsourcing** from verified commuters, its data model is architected to support seamless **Internet of Things (IoT) Integration**. 
* **The Vision:** Connecting urban road sensors, water level meters, and smart municipal CCTV cameras directly to the Ligtas-Larga API.
* **The Impact:** As sensors detect rising waters or blockages, the system will automatically log, adjust, or retire hazard pins in real-time, removing the burden of manual reporting and providing absolute path accuracy.

---

## 🛠️ Technology Stack

### Core Frameworks & Database:
* **Frontend/Backend:** Next.js 16 (App Router & Server Actions)
* **Language:** TypeScript
* **Database Client:** Prisma ORM (v7)
* **Database Hosting:** Supabase (PostgreSQL with transaction connection pooling)
* **Styling:** Custom Vanilla CSS (fluid glassmorphism, native dark/light modes)

### Google Technologies & SDKs:
* **Google Maps JS SDK:** Standard vector/raster map rendering with customized accessibility layers.
* **Google Places API:** Classic `AutocompleteService` suggestions and Geocoder `placeId` queries for highly secure, billing-safe address resolution.
* **Google Routes API:** Complex polyline computation, segment durations, and transit step queries.

---

## 👥 Development Team
* **Jarren Irvine F. Duron**
* **Ma. Victoria C. Narte**
* **Precious Marian V. Cruz**
* **Geane Alexandra M. Remolacio**

---

## 🚀 Localhost Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/JJ-l4lbs/Ligtas-Larga.git
cd Ligtas-Larga
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory. This file is required to connect to external services. Add the following keys:

```env
# --- GOOGLE MAPS, PLACES, & ROUTES API ---
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"

# --- HUGGING FACE INFERENCE API ---
HUGGING_FACE_API_KEY="YOUR_HUGGING_FACE_API_TOKEN"

# --- DATABASE CONFIGURATION ---
DATABASE_URL="YOUR_SUPABASE_TRANSACTION_POOL_CONNECTION_STRING"
DIRECT_URL="YOUR_SUPABASE_DIRECT_MIGRATION_CONNECTION_STRING"

# --- SUPABASE CONFIGURATION ---
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 4. Setup Database Models (Prisma)
Generate the Prisma Client types and sync schemas:
```bash
npx prisma generate
npx prisma db push
```

### 5. Seed Test Hazard Data
Populate the database with exactly 50 hand-crafted accessibility hazards aligned to major corridors and train stations in Metro Manila:
```bash
npm run seed-test
```

### 6. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

### 7. Run Production Build Check
To verify compilation and page bundle optimization:
```bash
npm run build
```
