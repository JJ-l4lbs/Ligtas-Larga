# Database Schema: Ligtas-Lakbay

## 1. Database Paradigm
Ligtas-Lakbay uses SQLite as a relational data store. The database schema is defined using Prisma ORM.

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
| `isValidated` | `Boolean` | `@default(false)` | Flag indicating whether the report has been validated by Google Cloud Vision |
| `visionLabels` | `String?` | | JSON string representing labels returned by Cloud Vision API |
| `reportedAt` | `DateTime` | `@default(now())` | Timestamp when the report was submitted |

---

## 3. Prisma Schema Layout (`prisma/schema.prisma`)
This schema definition will be used directly to bootstrap our database.

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
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
