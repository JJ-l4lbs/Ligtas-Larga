# Database Schema: Ligtas-Lakbay

## 1. Database Paradigm
Ligtas-Lakbay uses Supabase PostgreSQL as its relational data store, optimized for serverless execution on Vercel via connection pooling to support its high-concurrency mobile-first architecture. The database schema is defined and generated using Prisma ORM.

---

## 2. Table Definitions

### Model: `HazardReport`
Represents a crowdsourced hazard logged by a commuter.

| Field Name | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Unique identifier for the report |
| `latitude` | `Float` | | Latitude coordinate of the hazard location |
| `longitude` | `Float` | | Longitude coordinate of the hazard location |
| `category` | `String` | | Hazard category (e.g., `FLOOD`, `OBSTACLE`, `ELEVATOR_BROKEN`, `RAMP_BLOCKED`) |
| `severity` | `String` | | Hazard severity level (`LOW`, `MEDIUM`, `HIGH`) |
| `description` | `String` | | User-submitted details about the hazard |
| `imageUrl` | `String?` | | URL/path of the uploaded verification image |
| `isValidated` | `Boolean` | `@default(false)` | Flag indicating whether the report has been validated by Hugging Face Inference API |
| `visionLabels` | `String?` | | JSON string representing labels returned by Hugging Face API |
| `reportedAt` | `DateTime` | `@default(now())` | Timestamp when the report was submitted |

### Model: `UserProfile`
Represents role configuration details for logged-in sessions.

| Field Name | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id` | Primary key, matches the Supabase Auth user ID |
| `email` | `String` | `@unique` | Email address of the registered commuter |
| `role` | `Role` | `@default(USER)` | System permission level (`USER` or `ADMIN`) |
| `createdAt` | `DateTime` | `@default(now())` | Timestamp when user was created |

---

## 3. Prisma Schema Layout (`prisma/schema.prisma`)
This schema definition is used directly to bootstrap our database. It references double environment variables (`DATABASE_URL` and `DIRECT_URL`) to support Supabase's transaction connection pooling.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Transaction pool URL (e.g., port 6543)
  directUrl = env("DIRECT_URL")     // Direct migration URL (e.g., port 5432)
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

model UserProfile {
  id          String       @id
  email       String       @unique
  role        Role         @default(USER)
  createdAt   DateTime     @default(now())
  savedPlaces SavedPlace[]
  savedRoutes SavedRoute[]
}

model SavedPlace {
  id        String      @id @default(uuid())
  userId    String
  label     String
  address   String
  latitude  Float
  longitude Float
  createdAt DateTime    @default(now())
  user      UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model SavedRoute {
  id            String      @id @default(uuid())
  userId        String
  label         String
  fromAddress   String
  toAddress     String
  fromLatitude  Float
  fromLongitude Float
  toLatitude    Float
  toLongitude   Float
  travelMode    String      // e.g. "wheelchair", "rain", "shaded", "mixed"
  createdAt     DateTime    @default(now())
  user          UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model HazardReport {
  id           String   @id @default(uuid())
  latitude     Float
  longitude    Float
  category     String
  severity     String
  description  String
  imageUrl     String?
  isValidated  Boolean  @default(false)
  visionLabels String?  // Stored as JSON string
  reportedAt   DateTime @default(now())
}
```

---

## 4. Row Level Security (RLS) Policies
Row Level Security is enabled (`rowsecurity = true`) on all tables inside Supabase PostgreSQL. This provides defense-in-depth security, ensuring that client-side Anon keys cannot bypass filters to manipulate other users' data.

| Table Name | RLS Status | Allowed Commands | Target Roles | Policy Logic (`USING` / `WITH CHECK`) |
| :--- | :--- | :--- | :--- | :--- |
| **`UserProfile`** | Enabled | `ALL` | `authenticated` | `auth.uid()::text = id` |
| **`SavedPlace`** | Enabled | `ALL` | `authenticated` | `auth.uid()::text = "userId"` |
| **`SavedRoute`** | Enabled | `ALL` | `authenticated` | `auth.uid()::text = "userId"` |
| **`HazardReport`**| Enabled | `SELECT` | `public` (All) | None (Publicly readable) |
| | | `INSERT` | `public` (All) | None (Publicly insertable) |
| | | `UPDATE`, `DELETE` | none (Restricted) | Admins bypass via database superuser `postgres` role |
