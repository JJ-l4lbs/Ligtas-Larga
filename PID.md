# Project Initiation Document (PID): Ligtas-Lakbay

## 1. Project Scope & Purpose
**Ligtas-Lakbay** is a crowdsourced, highly visual mapping and navigation mobile web application tailored for students, everyday urban commuters, and vulnerable sectors (PWDs, the elderly, pregnant women). Its core purpose is to provide dynamic, inclusive navigation that factors in physical infrastructure accessibility (e.g., ramps, broken elevators) and immediate environmental hazards (e.g., extreme heat, sudden flooding) while incorporating budget-friendly student transit options.

---

## 2. Core Business & Product Objectives
- **Empower Commuters:** Deliver a real-time, user-centric navigation experience that adapts to individual mobility constraints and localized environmental conditions.
- **Enable Crowdsourced Hazard Detection:** Build a self-sustaining civic engagement cycle where students and commuters log hazards, creating data transparency that helps vulnerable groups.
- **Support Inclusive Cities:** Categorize street infrastructure and weather hazards to provide data that could eventually assist local government units (LGUs) and planning authorities in prioritizing repairs.

---

## 3. Target Audience
1. **Everyday Commuters & Students:** Budget-conscious travelers navigating extreme heat, flash floods, and budget transit options (jeepneys, tricycles, buses).
2. **Vulnerable Sectors:** Persons with Disabilities (PWDs), senior citizens, and pregnant women who require step-free access, functioning elevators, and flat pavements.
3. **Local Communities:** Active citizens reporting urban hazards to keep their peers safe.

---

## 4. MVP Feature List
- **Multi-Profile Routing:**
  - **Wheelchair/Stroller Mode:** Prioritizes accessible ramps, flat terrains, and functioning elevators; avoids broken sidewalks and stair-only bridges.
  - **Student Mode:** Prioritizes shade, covered walkways, and cheap Public Utility Vehicles (PUVs) like jeepneys and tricycles.
  - **Rain Mode:** Avoids historically and currently reported flood-prone routes and waterlogged crossings.
- **Smart Hazard Reporting & Validation:**
  - **Interactive Report Form:** Simple photo capture and description interface for reporting issues (e.g., blocked sidewalks, high floods, broken elevators).
  - **Google Cloud Vision API Verification (Simulation/Integration):** Verifies uploaded image content to classify hazard types and gauge severity.
  - **Dynamic Map Annotations:** Custom map markers displaying user reports with verified statuses.
- **Interactive Map Dashboard:** A responsive mobile-first map interface displaying custom navigation routes, current weather-related overlays, and crowd-reported hazards.

---

## 5. Success Metrics
- **Verification Accuracy:** >85% accuracy in hazard classification using Google Cloud Vision API.
- **Active User Engagement:** Number of crowdsourced reports submitted per week.
- **Route Adoption Rate:** Percentage of users selecting alternative routes based on reported hazards.
- **Accessibility Index:** Number of accessibility hazards (e.g., broken ramps) logged and bypassed.

---

## 6. High-Level Constraints
- **Data Integrity:** Prevention of spam or fake hazard reports via location validation and automated photo verification.
- **API Quota Management:** Optimization of Google Maps Routes & Places API calls to remain cost-efficient.
- **Next.js Conventions:** Adherence to strict Next.js conventions (according to local docs).
- **Mobile-First Responsiveness:** The application must run perfectly on mobile browsers since it mimics a mobile navigation app.
