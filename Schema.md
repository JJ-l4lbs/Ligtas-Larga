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

---

## 3. Prisma Schema Layout (`prisma/schema.prisma`)
This schema definition will be used directly to bootstrap our database. It references double environment variables (`DATABASE_URL` and `DIRECT_URL`) to support Supabase's transaction connection pooling.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Transaction pool URL (e.g., port 6543)
  directUrl = env("DIRECT_URL")     // Direct migration URL (e.g., port 5432)
}

generator client {
  provider = "prisma-client-js"
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
