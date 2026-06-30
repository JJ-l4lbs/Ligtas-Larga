# Progress Ledger: Ligtas-Lakbay

This ledger maps out the frontend and backend development tasks required to build the Ligtas-Lakbay web application, designed from the ground up as a mobile-first architecture. Use it to track the exact progress and steps during the development lifecycle. It is fully configured for deployment on Vercel using Supabase PostgreSQL.

---

## 1. Frontend Development Tasks

| Task ID | Component / Area | Build.md Step | Status | Action Items & Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **FE-1.1** | Project Initialization | Step 1.1 | ⏳ Pending | - Set up boilerplate layout under `/app` structure<br/>- Ensure TypeScript paths and `tsconfig.json` align with modular styling |
| **FE-4.1** | CSS Design Token Framework | Step 4.1 | ⏳ Pending | - Define global color variables (Deep Charcoal base, neon mode accents)<br/>- Implement utility classes for glassmorphic containers and UI sliders |
| **FE-5.1** | Interactive Map Canvas | Step 5.1 | ⏳ Pending | - Use `@react-google-maps/api` hook to load maps canvas<br/>- Center viewport on target city coordinates<br/>- Fetch and render custom markers for hazard points |
| **FE-6.1** | Initial Location Picker & Search | Step 6.1 | ⏳ Pending | - Create landing/intro screen layout to solicit origin & destination<br/>- Attach Places API autocomplete to search inputs<br/>- Implement floating dashboard search overlay for on-the-fly route modifications |
| **FE-6.2** | Routing Profile Drawer & Logic | Step 6.2 | ⏳ Pending | - Create profile selector drawer (Accessibility, Student, Rain modes)<br/>- Integrate Directions Service path overlay on map canvas<br/>- Pass coordinates of severe hazards to bypass obstacles dynamically |
| **FE-7.1** | Smart Hazard Reporting Form | Step 7.1 | ⏳ Pending | - Create reporting modal triggered from dashboard button<br/>- Build image upload picker interface with drag-and-drop support<br/>- Provide validation state loading indicators during Cloud Vision checks |

---

## 2. Backend Development Tasks

| Task ID | Service / API Route | Build.md Step | Status | Action Items & Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **BE-1.2** | Package & Environment Config | Step 1.2, 1.3 | ⏳ Pending | - Install dependencies (`@prisma/client`, `@google-cloud/vision`, `prisma` CLI)<br/>- Configure `.env.local` with API Keys and Supabase pooled connection strings |
| **BE-2.1** | Database Setup & Prisma ORM | Step 2.1, 2.2 | ⏳ Pending | - Write `HazardReport` schema model in `/prisma/schema.prisma` targeting `postgresql` provider<br/>- Run migrations to synchronize tables with Supabase cloud database |
| **BE-2.3** | Supabase Mock Seeding | Step 2.3 | ⏳ Pending | - Build database seed script containing initial hazards near MVP area<br/>- Execute seed script and verify in Supabase or Prisma Studio |
| **BE-3.1** | Crowdsourced Reports API | Step 3.1 | ⏳ Pending | - Develop route `/api/reports` handler supporting GET (all verified reports) and POST (inserting user-submitted hazards to Supabase) |
| **BE-3.2** | Cloud Vision Image Verification | Step 3.2 | ⏳ Pending | - Develop POST endpoint `/api/vision` accepting base64/file upload data<br/>- Forward image payload to Cloud Vision API client<br/>- Parse classification labels to verify reported hazard legitimacy |
