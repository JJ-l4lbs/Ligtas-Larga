const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

// Load connection string from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding for route testing...");

  // 1. Clear existing hazard reports to start fresh
  await prisma.hazardReport.deleteMany({});
  console.log("Cleared existing hazard reports.");

  // 2. Define test hazards strategically placed on route choices between
  // Manila City Hall (14.5895, 120.9816) and DLSU Taft (14.5674, 120.9932)
  const testHazards = [
    {
      id: "test-flood-taft",
      latitude: 14.5826,
      longitude: 120.9844,
      category: "FLOOD",
      severity: "HIGH",
      description: "Severe flooding near United Nations Ave Station on Taft Avenue, impassable for pedestrians.",
      imageUrl: null,
      isValidated: true,
      visionLabels: JSON.stringify(["flooding", "water", "street"])
    },
    {
      id: "test-ramp-orosa",
      latitude: 14.5800,
      longitude: 120.9810,
      category: "RAMP_BLOCKED",
      severity: "HIGH",
      description: "Construction barriers completely blocking the wheelchair ramp access on Maria Orosa Street.",
      imageUrl: null,
      isValidated: true,
      visionLabels: JSON.stringify(["barrier", "obstacle", "street"])
    },
    {
      id: "test-elevator-marcelino",
      latitude: 14.5750,
      longitude: 120.9900,
      category: "ELEVATOR_BROKEN",
      severity: "HIGH",
      description: "Subway/LRT station elevator out of service near San Marcelino crossing, no wheelchair access.",
      imageUrl: null,
      isValidated: true,
      visionLabels: JSON.stringify(["elevator", "broken"])
    }
  ];

  for (const hazard of testHazards) {
    await prisma.hazardReport.create({
      data: hazard
    });
  }

  console.log(`Successfully seeded ${testHazards.length} test hazards for route validation.`);
}

main()
  .catch((e) => {
    console.error("Error seeding hazards:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
