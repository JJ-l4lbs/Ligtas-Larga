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

const testHazards = [
  // --- LRT-1 Station Hazards (12 distinct stations) ---
  {
    id: "lrt1-baclaran-elevator",
    latitude: 14.5283,
    longitude: 120.9980,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "LRT-1 Baclaran Station main concourse elevator is out of service. Commuters needing stepless access must request staff assistance at the service gate.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "lrt1-baclaran"])
  },
  {
    id: "lrt1-edsa-ramp",
    latitude: 14.5378,
    longitude: 120.9982,
    category: "RAMP_BLOCKED",
    severity: "HIGH",
    description: "Wheelchair accessibility ramp at the Taft Avenue entrance of LRT-1 EDSA station is blocked by concrete barriers due to step repairs.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "barrier", "station-access", "lrt1-edsa"])
  },
  {
    id: "lrt1-buendia-obstacle",
    latitude: 14.5540,
    longitude: 120.9970,
    category: "PATHWAY_OBSTACLE",
    severity: "MEDIUM",
    description: "Sidewalk heavily congested with temporary street vendor stalls right underneath the Gil Puyat LRT station exit, forcing pedestrians to walk on the main road.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["sidewalk-blocked", "obstacle", "lrt1-buendia"])
  },
  {
    id: "lrt1-vitocruz-flood",
    latitude: 14.5630,
    longitude: 120.9950,
    category: "FLOOD",
    severity: "HIGH",
    description: "Moderate street flooding near the Vito Cruz LRT Station entrance along Taft Avenue, making the pedestrian crosswalk flooded.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["flooding", "water", "roadway", "lrt1-vitocruz"])
  },
  {
    id: "lrt1-un-elevator",
    latitude: 14.5826,
    longitude: 120.9844,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "LRT-1 United Nations Station street-level elevator is broken. Wheelchair users must proceed to Central Terminal for stepless platform access.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "lrt1-un"])
  },
  {
    id: "lrt1-central-obstacle",
    latitude: 14.5928,
    longitude: 120.9818,
    category: "PATHWAY_OBSTACLE",
    severity: "LOW",
    description: "Construction debris from road rehabilitation blocking the sidewalk pavement adjacent to the Central Terminal Station exit.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["obstacle", "construction-debris", "lrt1-central"])
  },
  {
    id: "lrt1-carriedo-ramp",
    latitude: 14.5990,
    longitude: 120.9810,
    category: "RAMP_BLOCKED",
    severity: "MEDIUM",
    description: "Tactile paving guide path and ramp leading to Carriedo Station entrance are blocked by commercial display racks from nearby shops.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "obstacle", "station-access", "lrt1-carriedo"])
  },
  {
    id: "lrt1-tayuman-elevator",
    latitude: 14.6200,
    longitude: 120.9850,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "Street-level elevator at Tayuman LRT Station is out of service for regular maintenance. No wheelchair ramp alternative is available.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "lrt1-tayuman"])
  },
  {
    id: "lrt1-blumentritt-obstacle",
    latitude: 14.6270,
    longitude: 120.9830,
    category: "PATHWAY_OBSTACLE",
    severity: "MEDIUM",
    description: "Severe sidewalk narrowing and temporary fencing on Rizal Avenue near Blumentritt due to drainage repairs.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["pathway-narrow", "obstacle", "lrt1-blumentritt"])
  },
  {
    id: "lrt1-monumento-construction",
    latitude: 14.6575,
    longitude: 120.9835,
    category: "CONSTRUCTION",
    severity: "MEDIUM",
    description: "Active utility maintenance digging and scaffolding blocking the pedestrian crossing lanes near the Monumento circle crossing.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["construction", "roadworks", "monumento-circle"])
  },
  {
    id: "lrt1-balintawak-elevator",
    latitude: 14.6575,
    longitude: 121.0028,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "LRT-1 Balintawak Station platform elevator is currently offline. Accessibility commuters are advised to plan alternative drop-offs.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "lrt1-balintawak"])
  },
  {
    id: "lrt1-roosevelt-ramp",
    latitude: 14.6575,
    longitude: 121.0210,
    category: "RAMP_BLOCKED",
    severity: "HIGH",
    description: "Sidewalk accessibility ramp near FPJ Roosevelt Station terminal is blocked by illegal motorcycle parking, restricting access.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "obstacle", "station-access", "lrt1-roosevelt"])
  },

  // --- MRT-3 Station Hazards (13 distinct stations) ---
  {
    id: "mrt3-taft-elevator",
    latitude: 14.5376,
    longitude: 121.0013,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "MRT-3 Taft Avenue Station transfer lift is out of service. Transfer to LRT-1 requires navigating stairs.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "mrt3-taft"])
  },
  {
    id: "mrt3-magallanes-ramp",
    latitude: 14.5420,
    longitude: 121.0195,
    category: "RAMP_BLOCKED",
    severity: "MEDIUM",
    description: "The wheelchair access ramp on the south exit of Magallanes Station is blocked due to active steel post painting works.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "barrier", "station-access", "mrt3-magallanes"])
  },
  {
    id: "mrt3-ayala-obstacle",
    latitude: 14.5490,
    longitude: 121.0278,
    category: "PATHWAY_OBSTACLE",
    severity: "HIGH",
    description: "Broken pavement tiles and a deep uncovered hole on the sidewalk pathway near the Ayala MRT Station bus bay entrance.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["broken-tiles", "obstacle", "sidewalk-hazard", "mrt3-ayala"])
  },
  {
    id: "mrt3-buendia-elevator",
    latitude: 14.5570,
    longitude: 121.0335,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "Underground street-to-concourse lift at MRT-3 Buendia Station is out of order. Stair lift is operational with security assistance.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "mrt3-buendia"])
  },
  {
    id: "mrt3-guadalupe-obstacle",
    latitude: 14.5670,
    longitude: 121.0455,
    category: "PATHWAY_OBSTACLE",
    severity: "LOW",
    description: "Narrow, slippery pedestrian pathway along the Guadalupe MRT bridge walkway due to condensation leaks from overhead pipes.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["slippery-path", "obstacle", "mrt3-guadalupe"])
  },
  {
    id: "mrt3-boni-construction",
    latitude: 14.5738,
    longitude: 121.0482,
    category: "CONSTRUCTION",
    severity: "MEDIUM",
    description: "Ongoing building construction has erected temporary scaffolding that blocks the sidewalk under the Boni Station north exit.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["construction", "scaffolding", "mrt3-boni"])
  },
  {
    id: "mrt3-shaw-elevator",
    latitude: 14.5812,
    longitude: 121.0536,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "The elevator connecting the platform to the concourse at Shaw Boulevard MRT station is broken. Accessible users must request manual lift.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "mrt3-shaw"])
  },
  {
    id: "mrt3-ortigas-ramp",
    latitude: 14.5878,
    longitude: 121.0567,
    category: "RAMP_BLOCKED",
    severity: "MEDIUM",
    description: "Wheelchair ramp at Ortigas MRT station street entrance is blocked by temporary metal barriers from road sweepers.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "barrier", "station-access", "mrt3-ortigas"])
  },
  {
    id: "mrt3-santolan-elevator",
    latitude: 14.6075,
    longitude: 121.0563,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "Santolan-Annapolis MRT Station elevator is out of order. No ramp alternative is available to reach the platform level.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "mrt3-santolan"])
  },
  {
    id: "mrt3-cubao-obstacle",
    latitude: 14.6222,
    longitude: 121.0520,
    category: "PATHWAY_OBSTACLE",
    severity: "MEDIUM",
    description: "Pedestrian footbridge linking MRT Cubao to nearby malls is obstructed by illegal vendors, leaving a narrow, unsafe path.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["sidewalk-blocked", "obstacle", "mrt3-cubao"])
  },
  {
    id: "mrt3-kamuning-elevator",
    latitude: 14.6352,
    longitude: 121.0433,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "The street elevator for MRT-3 Kamuning Station is shut down due to electrical repairs. The station has no wheelchair access.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "mrt3-kamuning"])
  },
  {
    id: "mrt3-quezon-ramp",
    latitude: 14.6425,
    longitude: 121.0385,
    category: "RAMP_BLOCKED",
    severity: "HIGH",
    description: "Wheelchair ramp at the Centris side of Quezon Ave MRT is blocked by structural restoration poles.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "obstacle", "station-access", "mrt3-quezon"])
  },
  {
    id: "mrt3-north-construction",
    latitude: 14.6532,
    longitude: 121.0308,
    category: "CONSTRUCTION",
    severity: "MEDIUM",
    description: "Construction of the Unified Grand Central Station has closed the main sidewalk pathway, diverting commuters to a temporary uneven lane.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["construction", "roadworks", "mrt3-north"])
  },

  // --- LRT-2 Station Hazards (10 distinct stations) ---
  {
    id: "lrt2-recto-elevator",
    latitude: 14.6038,
    longitude: 120.9833,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "LRT-2 Recto Station main transfer elevator is out of service. Accessing the platform requires using the escalators or calling staff.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "lrt2-recto"])
  },
  {
    id: "lrt2-legarda-ramp",
    latitude: 14.6008,
    longitude: 120.9922,
    category: "RAMP_BLOCKED",
    severity: "MEDIUM",
    description: "Legarda LRT-2 street exit ramp is blocked by a parked vehicle and trash bins, limiting access to wheelchairs.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "obstacle", "station-access", "lrt2-legarda"])
  },
  {
    id: "lrt2-pureza-obstacle",
    latitude: 14.6015,
    longitude: 121.0055,
    category: "PATHWAY_OBSTACLE",
    severity: "HIGH",
    description: "A deep, unbarricaded excavation on the sidewalk right outside the Pureza LRT station steps, dangerous for visually impaired users.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["broken-tiles", "obstacle", "sidewalk-hazard", "lrt2-pureza"])
  },
  {
    id: "lrt2-vmapa-elevator",
    latitude: 14.6025,
    longitude: 121.0182,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "V. Mapa LRT-2 Station platform elevator is broken. Wheelchair users must use the service elevator at the opposite concourse.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "lrt2-vmapa"])
  },
  {
    id: "lrt2-jruiz-ramp",
    latitude: 14.6105,
    longitude: 121.0302,
    category: "RAMP_BLOCKED",
    severity: "MEDIUM",
    description: "Sidewalk ramp at J. Ruiz Station entrance is blocked by structural maintenance scaffolding.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "barrier", "station-access", "lrt2-jruiz"])
  },
  {
    id: "lrt2-gilmore-obstacle",
    latitude: 14.6135,
    longitude: 121.0345,
    category: "PATHWAY_OBSTACLE",
    severity: "MEDIUM",
    description: "Sidewalk on Aurora Blvd outside Gilmore LRT is congested with parked motorbikes, forcing pedestrians to walk on the road.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["sidewalk-blocked", "obstacle", "lrt2-gilmore"])
  },
  {
    id: "lrt2-bettygo-elevator",
    latitude: 14.6188,
    longitude: 121.0425,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "Betty Go-Belmonte Station street-to-concourse lift is broken. Commuters needing assistance must request the station supervisor.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "lrt2-bettygo"])
  },
  {
    id: "lrt2-cubao-ramp",
    latitude: 14.6220,
    longitude: 121.0535,
    category: "RAMP_BLOCKED",
    severity: "MEDIUM",
    description: "Access ramp at the Gateway Mall link of Cubao LRT-2 is blocked by temporary event banners and commercial booths.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "barrier", "station-access", "lrt2-cubao"])
  },
  {
    id: "lrt2-anonas-elevator",
    latitude: 14.6278,
    longitude: 121.0645,
    category: "ELEVATOR_BROKEN",
    severity: "HIGH",
    description: "Anonas LRT-2 platform elevator is out of order. Stepless access is temporarily unavailable at this station.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["elevator", "broken", "station-lift", "lrt2-anonas"])
  },
  {
    id: "lrt2-katipunan-obstacle",
    latitude: 14.6318,
    longitude: 121.0725,
    category: "PATHWAY_OBSTACLE",
    severity: "LOW",
    description: "Sidewalk pathway leading to the Katipunan LRT Station North Entrance is obstructed by heavy foliage and low-hanging cables.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["obstacle", "sidewalk-hazard", "lrt2-katipunan"])
  },

  // --- Roxas Boulevard & Manila Bay Area (5 distinct locations) ---
  {
    id: "road-roxas-luneta-construction",
    latitude: 14.5815,
    longitude: 120.9760,
    category: "CONSTRUCTION",
    severity: "MEDIUM",
    description: "Pedestrian baywalk path at Roxas Boulevard is closed for seawall maintenance and path rehabilitation works.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["construction", "baywalk", "roxas-blvd"])
  },
  {
    id: "road-roxas-un-ramp",
    latitude: 14.5790,
    longitude: 120.9780,
    category: "RAMP_BLOCKED",
    severity: "HIGH",
    description: "Wheelchair ramp at the pedestrian overpass crossing Roxas Boulevard near UN Ave is blocked by construction materials.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "barrier", "roxas-blvd"])
  },
  {
    id: "road-roxas-quirino-flood",
    latitude: 14.5660,
    longitude: 120.9840,
    category: "FLOOD",
    severity: "MEDIUM",
    description: "Street flooding along Roxas Boulevard near Quirino Avenue during high tide, overflowing onto the pedestrian pathway.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["flooding", "water", "roxas-blvd"])
  },
  {
    id: "road-roxas-buendia-obstacle",
    latitude: 14.5510,
    longitude: 120.9850,
    category: "PATHWAY_OBSTACLE",
    severity: "HIGH",
    description: "Heavy excavation work on the sidewalk of Roxas Blvd at the corner of Buendia, creating a steep, muddy drop.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["broken-tiles", "obstacle", "roxas-blvd"])
  },
  {
    id: "road-roxas-edsa-construction",
    latitude: 14.5340,
    longitude: 120.9900,
    category: "CONSTRUCTION",
    severity: "MEDIUM",
    description: "Ongoing utility installation has closed the pedestrian lane on the Roxas Boulevard flyover exit, forcing users into the highway shoulder.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["construction", "roadworks", "roxas-blvd"])
  },

  // --- Major Road Intersections (10 distinct locations) ---
  {
    id: "road-qave-rotonda-flood",
    latitude: 14.6190,
    longitude: 121.0020,
    category: "FLOOD",
    severity: "HIGH",
    description: "Moderate flooding at the pedestrian crossing of Welcome Rotonda, making it impossible to cross without stepping in deep water.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["flooding", "water", "welcome-rotonda"])
  },
  {
    id: "road-qave-araneta-flood",
    latitude: 14.6250,
    longitude: 121.0120,
    category: "FLOOD",
    severity: "HIGH",
    description: "High flooding along Araneta Ave corner Quezon Ave, completely blocking pedestrian pathways and underpasses.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["flooding", "water", "araneta-ave"])
  },
  {
    id: "road-qave-circle-obstacle",
    latitude: 14.6510,
    longitude: 121.0490,
    category: "PATHWAY_OBSTACLE",
    severity: "LOW",
    description: "Sidewalk tiles around the Quezon Memorial Circle pedestrian pathway are broken and loose, forming tripping hazards.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["broken-tiles", "tripping-hazard", "qc-circle"])
  },
  {
    id: "road-ayala-paseo-construction",
    latitude: 14.5570,
    longitude: 121.0170,
    category: "CONSTRUCTION",
    severity: "LOW",
    description: "Active utility manhole rehabilitation on Ayala Avenue at Paseo de Roxas, blocking one pedestrian crossing lane.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["construction", "roadworks", "ayala-ave"])
  },
  {
    id: "road-ayala-makati-ramp",
    latitude: 14.5550,
    longitude: 121.0220,
    category: "RAMP_BLOCKED",
    severity: "MEDIUM",
    description: "Street-level wheelchair ramp near Ayala Triangle park entrance is blocked by temporary barrier gates.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["ramp-blocked", "barrier", "ayala-triangle"])
  },
  {
    id: "road-shaw-kalentong-flood",
    latitude: 14.5900,
    longitude: 121.0260,
    category: "FLOOD",
    severity: "MEDIUM",
    description: "Frequent minor flooding on Shaw Boulevard near Kalentong intersection during heavy downpours, submerging the sidewalk curb.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["flooding", "water", "shaw-blvd"])
  },
  {
    id: "road-shaw-acacia-obstacle",
    latitude: 14.5880,
    longitude: 121.0370,
    category: "PATHWAY_OBSTACLE",
    severity: "MEDIUM",
    description: "Sidewalk on Shaw Boulevard near Acacia Lane is severely cracked and blocked by utility poles, forcing pedestrians onto the road.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["sidewalk-blocked", "obstacle", "shaw-blvd"])
  },
  {
    id: "road-espana-ust-flood",
    latitude: 14.6080,
    longitude: 120.9910,
    category: "FLOOD",
    severity: "HIGH",
    description: "Frequent street flooding along España Boulevard outside UST Gate, subverting the sidewalk and pedestrian crosswalks.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["flooding", "water", "espana-blvd"])
  },
  {
    id: "road-bgc-5th-construction",
    latitude: 14.5485,
    longitude: 121.0445,
    category: "CONSTRUCTION",
    severity: "LOW",
    description: "Walkway improvement works on 5th Avenue in BGC have blocked the middle pedestrian lane, narrowing the path.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["construction", "roadworks", "bgc"])
  },
  {
    id: "road-bgc-32nd-obstacle",
    latitude: 14.5530,
    longitude: 121.0490,
    category: "PATHWAY_OBSTACLE",
    severity: "MEDIUM",
    description: "Sidewalk excavation for cable placement along 32nd Street near the highway entrance, creating a narrow dirt path.",
    imageUrl: null,
    isValidated: true,
    visionLabels: JSON.stringify(["obstacle", "sidewalk-hazard", "bgc"])
  }
];

async function main() {
  console.log("Starting database seeding for exactly 50 hand-crafted hazards in Metro Manila...");

  // 1. Clear existing hazard reports
  await prisma.hazardReport.deleteMany({});
  console.log("Cleared existing hazard reports.");

  // Process hazards to add a 2-day expiration timer to all FLOOD category hazards
  const processedHazards = testHazards.map((hazard) => {
    if (hazard.category === "FLOOD") {
      return {
        ...hazard,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      };
    }
    return hazard;
  });

  // Insert generated hazards in batch
  const result = await prisma.hazardReport.createMany({
    data: processedHazards
  });

  console.log(`Successfully seeded ${result.count} highly-spread, road-aligned hazards across Metro Manila.`);
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
