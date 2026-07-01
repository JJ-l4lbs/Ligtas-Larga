# Progress Ledger: Ligtas-Lakbay

This ledger maps out the frontend and backend development tasks required to build the Ligtas-Lakbay web application, designed from the ground up as a mobile-first architecture. Use it to track the exact progress and steps during the development lifecycle. It is fully configured for deployment on Vercel using Supabase PostgreSQL.

---

## 1. Frontend Development Tasks

| Task ID | Component / Area | Build.md Step | Status | Action Items & Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **FE-1.1** | Project Initialization | Step 1.1 | ✅ Complete | - Set up boilerplate layout under `/app` structure<br/>- Ensure TypeScript paths and `tsconfig.json` align with modular styling |
| **FE-4.1** | CSS Design Token Framework | Step 4.1 | ✅ Complete | - Define global color variables (Deep Charcoal base, neon mode accents)<br/>- Implement utility classes for glassmorphic containers and UI sliders |
| **FE-5.1** | Interactive Map Canvas | Step 5.1 | ✅ Complete | - Use `@react-google-maps/api` hook to load maps canvas<br/>- Center viewport on target city coordinates<br/>- Fetch and render custom markers for hazard points |
| **FE-6.1** | Initial Location Picker & Search | Step 6.1 | ✅ Complete | - Create landing/intro screen layout to solicit origin & destination<br/>- Attach Places API autocomplete to search inputs<br/>- Implement floating dashboard search overlay for on-the-fly route modifications |
| **FE-6.2** | Routing Profile Drawer & Logic | Step 6.2 | ✅ Complete | - Create profile selector drawer (Accessibility, Student, Rain modes)<br/>- Integrate Directions Service path overlay on map canvas<br/>- Pass coordinates of severe hazards to bypass obstacles dynamically |
| **FE-7.1** | Smart Hazard Reporting Form | Step 7.1 | ✅ Complete | - Create reporting modal triggered from dashboard button<br/>- Build image upload picker interface with drag-and-drop support<br/>- Provide validation state loading indicators during Hugging Face checks |
| **FE-8.1** | Supabase Auth & Login Page | Step 8.1 | ⏳ Planned | - Create login page `/login` supporting user/admin credentials<br/>- Map session state checks to conditionally toggle submission permissions |
| **FE-8.3** | Admin Dashboard Layout | Step 8.3 | ⏳ Planned | - Design review queue layout at `/admin` displaying pending and verified lists<br/>- Implement visual verification toggles and descriptive fields editing |

---

## 2. Backend Development Tasks

| Task ID | Service / API Route | Build.md Step | Status | Action Items & Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **BE-1.2** | Package & Environment Config | Step 1.2, 1.3 | ✅ Complete | - Install dependencies (`@prisma/client`, `prisma` CLI)<br/>- Configure `.env.local` with API Keys, Hugging Face Token, and Supabase pooled connection strings |
| **BE-2.1** | Database Setup & Prisma ORM | Step 2.1, 2.2 | ✅ Complete | - Write `HazardReport` schema model in `/prisma/schema.prisma` targeting `postgresql` provider<br/>- Run migrations to synchronize tables with Supabase cloud database |
| **BE-2.3** | Supabase Mock Seeding | Step 2.3 | ✅ Complete | - Build database seed script containing initial hazards near MVP area<br/>- Execute seed script and verify in Supabase or Prisma Studio |
| **BE-3.1** | Crowdsourced Reports API | Step 3.1 | ✅ Complete | - Develop route `/api/reports` handler supporting GET (all verified reports) and POST (inserting user-submitted hazards to Supabase) |
| **BE-3.2** | Hugging Face Image Verification | Step 3.2 | ✅ Complete | - Develop POST endpoint `/api/vision` accepting base64/file upload data<br/>- Forward image payload to Hugging Face Inference API hosted model<br/>- Parse classification labels to verify reported hazard legitimacy |
| **BE-8.2** | Role Middleware Gateway | Step 8.2 | ⏳ Planned | - Configure root `middleware.ts` to intercept `/admin/*` and `/api/admin/*` paths<br/>- Validate user JWT session and role cookies to prevent unauthorized entries |
| **BE-8.4** | Admin Action API Handlers | Step 8.4 | ⏳ Planned | - Develop API route `/api/admin/reports` supporting PUT (update verification status / edit detail strings) and DELETE (delete reports) |
