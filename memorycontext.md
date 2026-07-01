# Contextual Memory Log: Ligtas-Larga

## Current Context
We are refining the visual stacking of hazard overlays on the map. The user requested that the currently hovered hazard marker and its tooltip must *always* be on top of all other markers and popups, even if there are permanently open ones. 
To achieve this:
1. Clicking/permanently opening a marker assigns it and its `InfoWindow` a `zIndex` of `highestZIndex` (incrementing on every click).
2. Hovering over a marker dynamically assigns the hovered marker and the `hoverInfoWindow` a temporary `zIndex` of `highestZIndex + 100`.
3. Unhovering resets the marker back to its default state.

---

## Accomplished Tasks
- **Branch Merging & Conflict Resolution:**
  - Created a local integration branch `dev-sidebar-merge` tracking `origin/Dev-Branch`.
  - Merged `origin/UI-Sidebar` into the branch.
  - Resolved conflicts in:
    - **[LocationPicker.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/LocationPicker.tsx):** Set label text color to standard panel-scoped variable `var(--text-on-app-left-secondary)`.
    - **[Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx):** Retained circular custom SVG hazard pins, POI visibility toggles, start/destination pins, and voice synthesizer from `Dev-Branch`, while incorporating layout class triggers and the floating Sidebar Toggle Button (`◄` / `☰`).
    - **[globals.css](file:///C:/AI-Integrated-Coding/SPARKFEST/styles/globals.css):** Maintained the pastel theme details while merging CSS transition rules and dynamic sidebar width styling.
  - Kept **[memorycontext.md](file:///C:/AI-Integrated-Coding/SPARKFEST/memorycontext.md)** intact.

- **Syntax & Compilation Fixes:**
  - Removed an accidental/redundant fullscreen map HTML paste from inside the left directions panel in `components/Map.tsx` that was causing syntax errors.
  - Set `unstable_instant = false` in `app/page.tsx` to opt out of instant navigation metadata pre-render check, resolving compile-time blocks since `cacheComponents` is enabled.

- **Refactoring & Code Bloat Reduction:**
  - Created a centralized utility file **[maps-utils.ts](file:///C:/AI-Integrated-Coding/SPARKFEST/lib/maps-utils.ts)** to hold Google Maps loading singleton hook, map style JSON configs, distance formulas, and formatting functions.
  - Extracted inline layout subcomponents from **[Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx)** into dedicated files:
    - **[BrandHeader.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/BrandHeader.tsx):** Logo header and dark theme switch controls.
    - **[SplashLoader.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/SplashLoader.tsx):** Hydration loading loader screen.
    - **[ImmediateActionCard.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/ImmediateActionCard.tsx):** Step direction pagination overlay layout.
    - **[MapControls.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/MapControls.tsx):** Zoom in/out and panning controllers.
  - Shaved off over 450 lines of code inside `components/Map.tsx` (bringing it under 1000 lines) to strictly follow the "No Bloated Code" philosophy.

- **Documentation & Plan Integration:**
  - Created **[Features.md](file:///C:/AI-Integrated-Coding/SPARKFEST/Features.md)** outlining all planned, implemented, and salvaged features.
  - Updated **[GEMINI.md](file:///C:/AI-Integrated-Coding/SPARKFEST/GEMINI.md)**, **[Build.md](file:///C:/AI-Integrated-Coding/SPARKFEST/Build.md)**, **[Progress.md](file:///C:/AI-Integrated-Coding/SPARKFEST/Progress.md)**, **[Schema.md](file:///C:/AI-Integrated-Coding/SPARKFEST/Schema.md)**, and **[PID.md](file:///C:/AI-Integrated-Coding/SPARKFEST/PID.md)** to include User/Admin sessions.

- **Map Hazard Marker Layering Stacking Fix:**
  - Configured a dynamic zIndex priority scheme in [Map.tsx](file:///C:/AI-Integrated-Coding/SPARKFEST/components/Map.tsx) to keep the last selected hazard popup on top of all others.

---

## Immediate Next Objectives
1. Implement the database enum `Role` and profile model `UserProfile` inside `prisma/schema.prisma` and run migration scripts.
2. Integrate Supabase Auth client wrapper functions.
3. Build the `/login` route form view.
4. Establish middleware protection for `/admin` pages and api routes.

---

## Execution Logs & Attempts
- *Attempt 1:* Successfully created all requested `.md` specifications based on the user's project descriptions.
- *Attempt 2:* Diagnosed and fixed API key warnings and initial load screens.
- *Attempt 3:* Merged `origin/UI-Sidebar` and resolved styling and file conflicts.
- *Attempt 4:* Removed redundant HTML snippets causing build failures and resolved Next.js static prerender checks.
- *Attempt 5:* Modularized Map utilities into `lib/maps-utils.ts` to reduce file bloat.
- *Attempt 6:* Integrated workmate's revamped fullscreen liquid gradient splash loader with sprite animations from `splash-screen-revamp` branch into the modular `SplashLoader.tsx` component.
- *Attempt 7:* Completed the planning specification updates for Role-Based Session Management features.
- *Attempt 8:* Resolved the floating UI blocking issue for hazard markers by introducing a progressive zIndex system on markers and InfoWindows.
- *Attempt 9:* Enhanced the hover trigger to dynamically bump the hovered marker and tooltip above all permanently opened markers (`highestZIndex + 100`).
