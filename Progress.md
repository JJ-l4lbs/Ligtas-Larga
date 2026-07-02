# Progress Ledger: Ligtas-Lakbay

This ledger maps out the frontend and backend development tasks required to build the Ligtas-Lakbay web application, designed from the ground up as a mobile-first architecture. Use it to track the exact progress and steps during the development lifecycle. It is fully configured for deployment on Vercel using Supabase PostgreSQL.

---

## 1. Frontend Development Tasks

| Task ID | Component / Area | Build.md Step | Status | Action Items & Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **FE-1.1** | Project Initialization | Step 1.1 | ✅ Complete | - Set up boilerplate layout under `/app` structure<br/>- Ensure TypeScript paths and `tsconfig.json` align with modular styling |
| **FE-4.1** | CSS Design Token Framework | Step 4.1 | ✅ Complete | - Define global color variables (Deep Charcoal base, neon mode accents)<br/>- Implement utility classes for glassmorphic containers and UI sliders |
| **FE-5.1** | Interactive Map Canvas | Step 5.1 | ✅ Complete | - Use `@react-google-maps/api` hook to load maps canvas<br/>- Center viewport on target city coordinates<br/>- Fetch and render custom markers for hazard points<br/>- Configure geographic bounding restrictions and set minZoom to prevent panning/zooming out of the Philippines (PH) |
| **FE-6.1** | Initial Location Picker & Search | Step 6.1 | ✅ Complete | - Create landing/intro screen layout to solicit origin & destination<br/>- Attach Places API autocomplete to search inputs, restricted strictly to the Philippines (PH)<br/>- Implement floating dashboard search overlay for on-the-fly route modifications, geocoded within the Philippines |
| **FE-6.2** | Routing Profile Drawer & Logic | Step 6.2 | ✅ Complete | - Create profile selector drawer (Accessibility, Student, Rain modes)<br/>- Integrate Directions Service path overlay on map canvas<br/>- Pass coordinates of severe hazards to bypass obstacles dynamically |
| **FE-7.1** | Smart Hazard Reporting Form | Step 7.1 | ✅ Complete | - Create reporting modal triggered from dashboard button<br/>- Build image upload picker interface with drag-and-drop support<br/>- Provide validation state loading indicators during Hugging Face checks |
| **FE-8.1** | Supabase Auth & Login Page | Step 8.1 | ✅ Complete | - Create login page `/login` supporting user/admin credentials<br/>- Map session state checks to conditionally toggle submission permissions |
| **FE-8.3** | Admin Dashboard Layout | Step 8.3 | ✅ Complete | - Design review queue layout at `/admin` displaying pending and verified lists<br/>- Implement visual verification toggles and descriptive fields editing |
| **FE-8.5** | Saved Places, Routes & Profile Dashboard | Step 8.5 | ✅ Complete | - Build UserProfileDashboard overlay manager in sidebar<br/>- Render saved places quick-shortcuts and route calculators<br/>- Integrate custom toast and confirmation overlays |
| **FE-8.6** | Admin Direct Map Pinning UI | Step 8.6 | ✅ Complete | - Add toggle button inside MapControls.tsx<br/>- Implement top status banner overlay with exit controls<br/>- Add header close button to HazardModal.tsx |
| **FE-8.7** | Seamless Login Page Transition | UX Enhancement | ✅ Complete | - Add full-screen animated gradient overlay on Log In click<br/>- Implement staggered routing delay for smooth visual transition<br/>- Add slide-up and fade-in keyframes to login card container |
| **FE-9.3** | Travel Mode UI Selectors | Step 9.3 | ✅ Complete | - Add horizontal sliding mode selector bar in LocationPicker.tsx and LeftPanel.tsx<br/>- Implement hover, active states, and icons for Walk, Commute, Cycle, Motorcycle, and Car |
| **FE-9.4** | Routing Hook Update | Step 9.4 | ✅ Complete | - Integrate selected travelMode state in useRouteCalculator.ts<br/>- Handle path color updates per mode and trigger commute fare engine |
| **FE-9.5** | Active Route UI Panel Update | Step 9.5 | ✅ Complete | - Display total commute cost and segment cost labels inside ActiveRoutePanel.tsx |
| **FE-9.6** | Commute Route Fallback & Split Cards | Step 9.5 | ✅ Complete | - Display estimated route warning banner in ActiveRoutePanel.tsx<br/>- Split ImmediateActionCard.tsx into Commute segment cards (with boarding stops and segment fares) and Generic turn-by-turn cards |

---

## 2. Backend Development Tasks

| Task ID | Service / API Route | Build.md Step | Status | Action Items & Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **BE-1.2** | Package & Environment Config | Step 1.2, 1.3 | ✅ Complete | - Install dependencies (`@prisma/client`, `prisma` CLI)<br/>- Configure `.env.local` with API Keys, Hugging Face Token, and Supabase pooled connection strings<br/>- Add `prisma generate` to the `build` script in `package.json` to ensure client generation succeeds during Vercel deployment builds<br/>- Configure explicit SSL options in `new Pool()` inside `lib/prisma.ts` for Vercel production serverless environments |
| **BE-2.1** | Database Setup & Prisma ORM | Step 2.1, 2.2 | ✅ Complete | - Write `HazardReport` schema model in `/prisma/schema.prisma` targeting `postgresql` provider<br/>- Run migrations to synchronize tables with Supabase cloud database |
| **BE-2.3** | Supabase Mock Seeding | Step 2.3 | ✅ Complete | - Build database seed script containing initial hazards near MVP area<br/>- Execute seed script and verify in Supabase or Prisma Studio |
| **BE-3.1** | Crowdsourced Reports API | Step 3.1 | ✅ Complete | - Develop route `/api/reports` handler supporting GET (all verified reports) and POST (inserting user-submitted hazards to Supabase) |
| **BE-3.2** | Hugging Face Image Verification | Step 3.2 | ✅ Complete | - Develop POST endpoint `/api/vision` accepting base64/file upload data<br/>- Forward image payload to Hugging Face Inference API hosted model<br/>- Parse classification labels to verify reported hazard legitimacy |
| **BE-8.2** | Role Middleware Gateway | Step 8.2 | ✅ Complete | - Configure root `proxy.ts` to intercept `/admin/*` and `/api/admin/*` paths<br/>- Validate user JWT session and role cookies to prevent unauthorized entries |
| **BE-8.4** | Admin Action API Handlers | Step 8.4 | ✅ Complete | - Develop API route `/api/admin/reports` supporting PUT (update verification status / edit detail strings) and DELETE (delete reports) |
| **BE-8.5** | Saved places, routes & account API | Step 8.5 | ✅ Complete | - Create /api/saved-places and /api/saved-routes handlers supporting GET, POST, DELETE<br/>- Implement Postgres superuser raw SQL query to delete auth users |
| **BE-8.6** | Admin Direct Placement Logic | Step 8.6 | ✅ Complete | - Bypass vision image requirement for admin submissions in HazardModal.tsx<br/>- Auto-exit pinning mode when form closes |
| **BE-9.1** | Commute Fare Calculator | Step 9.1 | ✅ Complete | - Create lib/commute-calculator.ts parser utility for fares CSV matrices<br/>- Implement lookup algorithms and fuzzy station name matching |
| **BE-9.2** | Route API Update | Step 9.2 | ✅ Complete | - Modify app/api/routes/route.ts to accept travelMode and request transit details from Google |
| **BE-9.3** | Routes API Commute Fallback | Step 9.2 | ✅ Complete | - Automatically fall back to DRIVE mode and estimate a commute fare when TRANSIT routes are empty or lack transit steps |
