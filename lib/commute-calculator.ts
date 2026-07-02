import fs from "fs";
import path from "path";

interface FareRow {
  distance: number;
  regular: number;
  discounted: number;
}

// Station name mapping overrides for common Google Maps API names
const stationOverrides: Record<string, string> = {
  // LRT-1
  "fernandopoejr": "roosevelt",
  "fpj": "roosevelt",
  "rooseveltlrt1": "roosevelt",
  "edsalrt1": "edsa",
  "unavenue": "unave",
  "unitednations": "unave",
  "centralterminal": "central",
  "doroteojose": "doroteojose",
  
  // LRT-2
  "aranetacentercubao": "aranetacubao",
  "aranetacubao": "araneta - cubao",
  "bettygobelmonte": "betty go-belmonte",
  "vmapa": "v. mapa",
  "jruiz": "j. ruins",
  
  // MRT-3
  "northavenue": "northave",
  "quezonavenue": "quezonave",
  "gmaakamuning": "kamuning",
  "aranetacoliseumcubao": "cubao",
  "shawboulevard": "shaw",
  "boniavenue": "boni",
  "sengilpuyat": "buendia",
  "ayalaavenue": "ayala",
  
  // PNR
  "spaa": "españa",
  "stamesa": "sta. mesa",
  "pacitamailinggate": "pacita main gate",
  "goldencity": "golden city 1",
  "binan": "biñan",
  "starosa": "sta. rosa",
};

function normalizeName(name: string): string {
  let cleaned = name
    .toLowerCase()
    .replace(/lrt[- ]?\d?/g, "")
    .replace(/mrt[- ]?\d?/g, "")
    .replace(/pnr/g, "")
    .replace(/station/g, "")
    .replace(/terminal/g, "")
    .replace(/line\s*\d/g, "")
    .replace(/[^a-z0-9\u00C0-\u024F]/g, "") // Keep accented characters for Spanish-Filipino names
    .trim();

  // Apply manual override mapping if matches
  if (stationOverrides[cleaned]) {
    cleaned = stationOverrides[cleaned].replace(/[^a-z0-9\u00C0-\u024F]/g, "").trim();
  }
  return cleaned;
}

// Finds the closest matching station in the matrix list
function findStationInList(targetName: string, list: string[]): string | null {
  const normTarget = normalizeName(targetName);
  
  // 1. Check exact normalized match
  for (const s of list) {
    if (normalizeName(s) === normTarget) return s;
  }

  // 2. Check partial inclusion
  for (const s of list) {
    const normStation = normalizeName(s);
    if (normTarget.includes(normStation) || normStation.includes(normTarget)) {
      return s;
    }
  }

  return null;
}

// Global cached matrices to avoid repeated file reads
let lrt1Matrix: Record<string, Record<string, number>> | null = null;
let lrt2Matrix: Record<string, Record<string, number>> | null = null;
let mrtMatrix: Record<string, Record<string, number>> | null = null;
let pnrMatrix: Record<string, Record<string, number>> | null = null;
let pujFares: FareRow[] | null = null;
let busAirconFares: FareRow[] | null = null;
let busOrdinaryFares: FareRow[] | null = null;

// Helper to load and parse matrix CSV files
function loadMatrix(fileName: string): Record<string, Record<string, number>> {
  const filePath = path.join(process.cwd(), "fares", fileName);
  const data = fs.readFileSync(filePath, "utf-8");
  const lines = data.split(/\r?\n/).filter(line => line.trim() !== "");
  
  const headers = lines[0].split(",").map(h => h.trim());
  // Remove first column header if empty
  const stations = headers.slice(1);
  
  const matrix: Record<string, Record<string, number>> = {};
  
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",");
    const origin = cells[0].trim();
    if (!origin) continue;
    
    matrix[origin] = {};
    for (let j = 1; j < cells.length; j++) {
      const dest = headers[j];
      if (!dest) continue;
      const fare = parseFloat(cells[j]) || 0;
      matrix[origin][dest] = fare;
    }
  }
  
  return matrix;
}

// Helper to load and parse distance lookup CSV files
function loadDistanceLookup(fileName: string): FareRow[] {
  const filePath = path.join(process.cwd(), "fares", fileName);
  const data = fs.readFileSync(filePath, "utf-8");
  const lines = data.split(/\r?\n/).filter(line => line.trim() !== "");
  
  const rows: FareRow[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const [distStr, regStr, discStr] = lines[i].split(",");
    if (!distStr) continue;
    rows.push({
      distance: parseFloat(distStr),
      regular: parseFloat(regStr) || 0,
      discounted: parseFloat(discStr) || 0
    });
  }
  
  // Sort by distance ascending
  return rows.sort((a, b) => a.distance - b.distance);
}

// Ensure all fare databases are loaded into cache
function ensureFaresLoaded() {
  if (!lrt1Matrix) lrt1Matrix = loadMatrix("lrt1_sj.csv"); // Using Single Journey as default
  if (!lrt2Matrix) lrt2Matrix = loadMatrix("lrt2_sj.csv");
  if (!mrtMatrix) mrtMatrix = loadMatrix("mrt.csv");
  if (!pnrMatrix) pnrMatrix = loadMatrix("pnr.csv");
  if (!pujFares) pujFares = loadDistanceLookup("puj.csv");
  if (!busAirconFares) busAirconFares = loadDistanceLookup("pub_aircon.csv");
  if (!busOrdinaryFares) busOrdinaryFares = loadDistanceLookup("pub_ordinary.csv");
}

export interface TransitLegInfo {
  type: "train" | "bus" | "jeepney" | "walk";
  lineName: string;
  agencyName?: string;
  distanceKm: number;
  originName: string;
  destinationName: string;
  fare: number;
  discountedFare: number;
  warning?: string;
}

/**
 * Calculates transit fare for a given transit route step.
 */
export function calculateLegFare(
  vehicleType: string, // e.g. SUBWAY, TRAM, BUS, RAIL
  lineName: string,
  agencyName: string,
  distanceMeters: number,
  originStop: string,
  destinationStop: string
): { fare: number; discountedFare: number; type: "train" | "bus" | "jeepney" | "walk"; warning?: string } {
  ensureFaresLoaded();

  const distanceKm = distanceMeters / 1000;
  const lineLower = lineName.toLowerCase();
  const agencyLower = agencyName.toLowerCase();

  // 1. Train Systems (LRT-1, LRT-2, MRT-3, PNR)
  if (vehicleType === "SUBWAY" || vehicleType === "RAIL" || lineLower.includes("lrt") || lineLower.includes("mrt") || lineLower.includes("pnr")) {
    let matrix: Record<string, Record<string, number>> | null = null;
    let systemLabel = "";

    if (lineLower.includes("lrt 1") || lineLower.includes("lrt-1") || lineLower.includes("lrt1") || agencyLower.includes("light rail transit authority")) {
      matrix = lrt1Matrix;
      systemLabel = "LRT-1";
    } else if (lineLower.includes("lrt 2") || lineLower.includes("lrt-2") || lineLower.includes("lrt2")) {
      matrix = lrt2Matrix;
      systemLabel = "LRT-2";
    } else if (lineLower.includes("mrt") || lineLower.includes("metro rail")) {
      matrix = mrtMatrix;
      systemLabel = "MRT-3";
    } else if (lineLower.includes("pnr") || lineLower.includes("philippine national") || agencyLower.includes("pnr") || agencyLower.includes("philippine national railways")) {
      matrix = pnrMatrix;
      systemLabel = "PNR";
    }

    if (matrix) {
      const stations = Object.keys(matrix);
      const startMatch = findStationInList(originStop, stations);
      const endMatch = findStationInList(destinationStop, stations);

      if (startMatch && endMatch) {
        const regularFare = matrix[startMatch][endMatch] ?? 0;
        // Discount is standard 20% off for student/PWD/senior, rounded up/down, or we can use exact mapping.
        // For trains, we can apply 20% discount (with minimum fare logic or direct math).
        // Let's compute a 20% discount mathematically (rounded to nearest peso) if no separate discounted matrix is supplied.
        const discountedFare = Math.round(regularFare * 0.8);
        return {
          fare: regularFare,
          discountedFare,
          type: "train"
        };
      } else {
        // Fallback to default minimum train fare if stops aren't matched exactly
        return {
          fare: 15,
          discountedFare: 12,
          type: "train",
          warning: `Fare estimated. Could not match stations "${originStop}" and "${destinationStop}" in ${systemLabel} database.`
        };
      }
    }
  }

  // 2. Bus (Public Bus)
  if (vehicleType === "BUS") {
    // Default to Aircon bus fares as it is the most common for Metro Manila main routes (like EDSA Carousel)
    const faresList = busAirconFares || [];
    const roundedDist = Math.max(1, Math.ceil(distanceKm));
    const matched = faresList.find(r => r.distance >= roundedDist) || faresList[faresList.length - 1];
    
    if (matched) {
      return {
        fare: matched.regular,
        discountedFare: matched.discounted,
        type: "bus"
      };
    }
  }

  // 3. Jeepney (PUJ) (Often returned as TRAM or BUS by Google transit engine depending on mapping)
  if (vehicleType === "TRAM" || lineLower.includes("jeepney") || lineLower.includes("puj") || agencyLower.includes("jeepney")) {
    const faresList = pujFares || [];
    const roundedDist = Math.max(1, Math.ceil(distanceKm));
    const matched = faresList.find(r => r.distance >= roundedDist) || faresList[faresList.length - 1];

    if (matched) {
      return {
        fare: matched.regular,
        discountedFare: matched.discounted,
        type: "jeepney"
      };
    }
  }

  // Default Fallback: Assume PUJ-like rate for general small transit vehicles
  const fallbackList = pujFares || [];
  const roundedDist = Math.max(1, Math.ceil(distanceKm));
  const matchedFallback = fallbackList.find(r => r.distance >= roundedDist) || fallbackList[fallbackList.length - 1];
  
  if (matchedFallback) {
    return {
      fare: matchedFallback.regular,
      discountedFare: matchedFallback.discounted,
      type: "jeepney",
      warning: `Vehicle type "${vehicleType}" mapped to default jeepney fares.`
    };
  }

  return { fare: 0, discountedFare: 0, type: "walk" };
}
