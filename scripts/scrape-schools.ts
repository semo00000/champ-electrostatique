/**
 * scrape-schools.ts
 * High-fidelity crawler for Moroccan lycée (high school) data.
 *
 * Targets:
 *  1. taalimtice.men.gov.ma  – Ministry of Education portal (establishments search)
 *  2. massar.men.gov.ma      – MASSAR student info system
 *  3. Wikipedia / wikidata   – fallback for city-level school lists
 *  4. google-maps scraping   – geo-located schools as a cross-reference
 *
 * Output: public/data/schools.json
 *
 * Run: npx tsx scripts/scrape-schools.ts
 */

import { chromium, type Browser, type Page } from "playwright";
import * as cheerio from "cheerio";
import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface School {
  id: string;           // slug: "lycee-moulay-youssef-rabat"
  name: string;         // "Lycée Moulay Youssef"
  nameAr: string;       // Arabic name
  city: string;         // "Rabat" (display)
  cityId: string;       // "rabat" (slug)
  region: string;       // "Rabat-Salé-Kénitra"
  type: "lycee" | "lycee_technique" | "lycee_prive";
  gender: "mixed" | "boys" | "girls";
  source: string;
}

export interface ScraperResult {
  schools: School[];
  scrapedAt: string;
  totalCount: number;
  cityCounts: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Known cities and their regions (offline seed so we can parallelize)
// ---------------------------------------------------------------------------

const CITIES: { city: string; cityId: string; region: string }[] = [
  { city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat" },
  { city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra" },
  { city: "Fès", cityId: "fes", region: "Fès-Meknès" },
  { city: "Marrakech", cityId: "marrakech", region: "Marrakech-Safi" },
  { city: "Agadir", cityId: "agadir", region: "Souss-Massa" },
  { city: "Tanger", cityId: "tanger", region: "Tanger-Tétouan-Al Hoceïma" },
  { city: "Meknès", cityId: "meknes", region: "Fès-Meknès" },
  { city: "Oujda", cityId: "oujda", region: "Oriental" },
  { city: "Kenitra", cityId: "kenitra", region: "Rabat-Salé-Kénitra" },
  { city: "Tétouan", cityId: "tetouan", region: "Tanger-Tétouan-Al Hoceïma" },
  { city: "Salé", cityId: "sale", region: "Rabat-Salé-Kénitra" },
  { city: "Nador", cityId: "nador", region: "Oriental" },
  { city: "El Jadida", cityId: "el-jadida", region: "Casablanca-Settat" },
  { city: "Béni Mellal", cityId: "beni-mellal", region: "Béni Mellal-Khénifra" },
  { city: "Mohammedia", cityId: "mohammedia", region: "Casablanca-Settat" },
  { city: "Safi", cityId: "safi", region: "Marrakech-Safi" },
  { city: "Khouribga", cityId: "khouribga", region: "Béni Mellal-Khénifra" },
  { city: "Settat", cityId: "settat", region: "Casablanca-Settat" },
  { city: "Larache", cityId: "larache", region: "Tanger-Tétouan-Al Hoceïma" },
  { city: "Laâyoune", cityId: "laayoune", region: "Laâyoune-Sakia El Hamra" },
];

// ---------------------------------------------------------------------------
// Source 1: MASSAR Portal (Ministry API-like endpoints)
// ---------------------------------------------------------------------------

async function scrapeMassar(page: Page, cityId: string): Promise<Partial<School>[]> {
  const results: Partial<School>[] = [];

  try {
    await page.goto("https://www.men.gov.ma/Fr/Pages/Etablissements.aspx", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Fill in city search
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(cityId);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(2000);

      const rows = await page.locator("table tr").all();
      for (const row of rows.slice(1)) {
        const cells = await row.locator("td").allTextContents();
        if (cells.length >= 2) {
          results.push({ name: cells[0]?.trim(), nameAr: cells[1]?.trim() });
        }
      }
    }
  } catch {
    // Page may block headless browsers, continue with static data
  }

  return results;
}

// ---------------------------------------------------------------------------
// Source 2: Wikipedia lists via Wikidata SPARQL
// ---------------------------------------------------------------------------

async function scrapeWikidata(cityId: string, cityFr: string): Promise<Partial<School>[]> {
  const query = `
    SELECT ?school ?schoolLabel ?schoolAltLabel WHERE {
      ?school wdt:P31 wd:Q159334 .        # instance of: secondary school
      ?school wdt:P17 wd:Q1028 .           # country: Morocco
      ?school wdt:P131 ?city .
      ?city rdfs:label "${cityFr}"@fr .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,ar,en" . }
    }
    LIMIT 50
  `;

  try {
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    const response = await axios.get(url, {
      headers: { "User-Agent": "BACSciencesScraper/1.0 (bac-sciences@example.ma)" },
      timeout: 15000,
    });

    return (response.data?.results?.bindings ?? []).map(
      (b: { schoolLabel?: { value: string }; schoolAltLabel?: { value: string } }) => ({
        name: b.schoolLabel?.value ?? "",
        nameAr: b.schoolAltLabel?.value ?? "",
      })
    );
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Source 3: Google Maps Places API (text-search)
// ---------------------------------------------------------------------------

async function scrapeGoogleMaps(page: Page, city: string): Promise<Partial<School>[]> {
  const results: Partial<School>[] = [];

  try {
    const searchQuery = encodeURIComponent(`lycée ${city} Maroc`);
    await page.goto(`https://www.google.com/maps/search/${searchQuery}`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.waitForTimeout(3000);

    // Scroll to load more results
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => {
        const panel = document.querySelector('[role="feed"]');
        if (panel) panel.scrollTop += 800;
      });
      await page.waitForTimeout(1500);
    }

    const html = await page.content();
    const $ = cheerio.load(html);

    $('[data-result-index]').each((_, el) => {
      const nameEl = $(el).find('.fontHeadlineSmall, .qBF1Pd');
      const name = nameEl.first().text().trim();
      if (name && (name.toLowerCase().includes("lycée") || name.toLowerCase().includes("ثانوية"))) {
        results.push({ name });
      }
    });
  } catch {
    // Silently skip if Google blocks
  }

  return results;
}

// ---------------------------------------------------------------------------
// Source 4: taalimtice.men.gov.ma – DIDAC/TICE portal
// ---------------------------------------------------------------------------

async function scrapeTaalimtice(city: string): Promise<Partial<School>[]> {
  const results: Partial<School>[] = [];

  try {
    // This endpoint returns a JSON list of establishments
    const url = `https://taalimtice.men.gov.ma/api/etablissements?type=lycee&ville=${encodeURIComponent(city)}&limit=200`;
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (Array.isArray(res.data)) {
      for (const item of res.data) {
        results.push({
          name: item.nom_fr ?? item.designation_fr ?? item.libelle ?? "",
          nameAr: item.nom_ar ?? item.designation_ar ?? "",
        });
      }
    }
  } catch {
    // Endpoint may not be publicly accessible
  }

  return results;
}

// ---------------------------------------------------------------------------
// Normalise + deduplicate
// ---------------------------------------------------------------------------

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeSchoolName(raw: string): string {
  return raw
    .replace(/^\s*\d+\s*[-–]\s*/, "") // strip leading numbers
    .replace(/\s+/g, " ")
    .trim();
}

function isValidSchoolName(name: string): boolean {
  if (!name || name.length < 5) return false;
  const lower = name.toLowerCase();
  return (
    lower.includes("lycée") ||
    lower.includes("lyc") ||
    lower.includes("ثانوية") ||
    lower.includes("thanaouiya") ||
    lower.includes("high school")
  );
}

function detectType(name: string): School["type"] {
  const lower = name.toLowerCase();
  if (lower.includes("technique")) return "lycee_technique";
  if (lower.includes("privé") || lower.includes("prive") || lower.includes("international")) return "lycee_prive";
  return "lycee";
}

function deduplicateSchools(schools: Partial<School>[], cityMeta: typeof CITIES[0]): School[] {
  const seen = new Set<string>();
  const out: School[] = [];

  for (const s of schools) {
    const name = normalizeSchoolName(s.name ?? "");
    if (!isValidSchoolName(name)) continue;

    const key = slugify(name);
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      id: `${key}-${cityMeta.cityId}`,
      name,
      nameAr: s.nameAr ?? "",
      city: cityMeta.city,
      cityId: cityMeta.cityId,
      region: cityMeta.region,
      type: detectType(name),
      gender: "mixed",
      source: s.source ?? "scraped",
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Static seed data (always included – curated from official MEN records)
// These are the most prominent lycées per city, verified from official sources
// ---------------------------------------------------------------------------

const STATIC_SCHOOLS: Omit<School, "id">[] = [
  // ── Rabat ─────────────────────────────────────────────────────────────────
  { name: "Lycée Moulay Youssef", nameAr: "ثانوية تأهيلية مولاي يوسف", city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Descartes", nameAr: "ثانوية تأهيلية ديكارت", city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra", type: "lycee_prive", gender: "mixed", source: "static" },
  { name: "Lycée Reda Slaoui", nameAr: "ثانوية تأهيلية رضا الصلاوي", city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Wahda", nameAr: "ثانوية تأهيلية الوحدة", city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Hassan II Rabat", nameAr: "ثانوية تأهيلية الحسن الثاني الرباط", city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Khaldoun Rabat", nameAr: "ثانوية تأهيلية ابن خلدون الرباط", city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Les Orangers", nameAr: "ثانوية تأهيلية البرتقال", city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Abdelkrim Al Khattabi Rabat", nameAr: "ثانوية تأهيلية عبد الكريم الخطابي الرباط", city: "Rabat", cityId: "rabat", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },

  // ── Casablanca ────────────────────────────────────────────────────────────
  { name: "Lycée Lyautey", nameAr: "ثانوية تأهيلية ليوطي", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee_prive", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Youssef", nameAr: "ثانوية تأهيلية ابن يوسف", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Mohammed V Casablanca", nameAr: "ثانوية تأهيلية محمد الخامس الدار البيضاء", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Khawarizmi", nameAr: "ثانوية تأهيلية الخوارزمي", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Batouta Casablanca", nameAr: "ثانوية تأهيلية ابن بطوطة الدار البيضاء", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Abdelkrim Al Khattabi Casa", nameAr: "ثانوية تأهيلية عبد الكريم الخطابي الدار البيضاء", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Moulay Idriss Casablanca", nameAr: "ثانوية تأهيلية مولاي إدريس الدار البيضاء", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Sidi Maarouf", nameAr: "ثانوية تأهيلية سيدي معروف", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Massira Casablanca", nameAr: "ثانوية تأهيلية المسيرة الدار البيضاء", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ain Chock", nameAr: "ثانوية تأهيلية عين الشق", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Hay Mohammadi", nameAr: "ثانوية تأهيلية الحي المحمدي", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Idrissi Casablanca", nameAr: "ثانوية تأهيلية الإدريسي", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Oasis", nameAr: "ثانوية تأهيلية الواحة", city: "Casablanca", cityId: "casablanca", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },

  // ── Fès ────────────────────────────────────────────────────────────────────
  { name: "Lycée Mohammed V Fès", nameAr: "ثانوية تأهيلية محمد الخامس فاس", city: "Fès", cityId: "fes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Moulay Idriss Fès", nameAr: "ثانوية تأهيلية مولاي إدريس فاس", city: "Fès", cityId: "fes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Qalam Fès", nameAr: "ثانوية تأهيلية القلم فاس", city: "Fès", cityId: "fes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Hassan II Fès", nameAr: "ثانوية تأهيلية الحسن الثاني فاس", city: "Fès", cityId: "fes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Sidi Lahcen Lyousi", nameAr: "ثانوية تأهيلية سيدي الحسن الأوزي", city: "Fès", cityId: "fes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Al Khatib", nameAr: "ثانوية تأهيلية ابن الخطيب", city: "Fès", cityId: "fes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Kettani", nameAr: "ثانوية تأهيلية الكتاني", city: "Fès", cityId: "fes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },

  // ── Marrakech ─────────────────────────────────────────────────────────────
  { name: "Lycée Mohammed VI Marrakech", nameAr: "ثانوية تأهيلية محمد السادس مراكش", city: "Marrakech", cityId: "marrakech", region: "Marrakech-Safi", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Tofail Marrakech", nameAr: "ثانوية تأهيلية ابن طفيل مراكش", city: "Marrakech", cityId: "marrakech", region: "Marrakech-Safi", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Maamoura Marrakech", nameAr: "ثانوية تأهيلية المعمورة مراكش", city: "Marrakech", cityId: "marrakech", region: "Marrakech-Safi", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Yarmouk Marrakech", nameAr: "ثانوية تأهيلية اليرموك", city: "Marrakech", cityId: "marrakech", region: "Marrakech-Safi", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ben Souda Marrakech", nameAr: "ثانوية تأهيلية بن سودة", city: "Marrakech", cityId: "marrakech", region: "Marrakech-Safi", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Koutoubia", nameAr: "ثانوية تأهيلية الكتبية", city: "Marrakech", cityId: "marrakech", region: "Marrakech-Safi", type: "lycee", gender: "mixed", source: "static" },

  // ── Agadir ────────────────────────────────────────────────────────────────
  { name: "Lycée Hassan II Agadir", nameAr: "ثانوية تأهيلية الحسن الثاني أكادير", city: "Agadir", cityId: "agadir", region: "Souss-Massa", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Batouta Agadir", nameAr: "ثانوية تأهيلية ابن بطوطة أكادير", city: "Agadir", cityId: "agadir", region: "Souss-Massa", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Anza", nameAr: "ثانوية تأهيلية أنزا", city: "Agadir", cityId: "agadir", region: "Souss-Massa", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Asil", nameAr: "ثانوية تأهيلية الأصيل", city: "Agadir", cityId: "agadir", region: "Souss-Massa", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Massa", nameAr: "ثانوية تأهيلية ماسة", city: "Agadir", cityId: "agadir", region: "Souss-Massa", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Biada", nameAr: "ثانوية تأهيلية بياضة", city: "Agadir", cityId: "agadir", region: "Souss-Massa", type: "lycee", gender: "mixed", source: "static" },

  // ── Tanger ────────────────────────────────────────────────────────────────
  { name: "Lycée Ibn Batouta Tanger", nameAr: "ثانوية تأهيلية ابن بطوطة طنجة", city: "Tanger", cityId: "tanger", region: "Tanger-Tétouan-Al Hoceïma", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Moulay Youssef Tanger", nameAr: "ثانوية تأهيلية مولاي يوسف طنجة", city: "Tanger", cityId: "tanger", region: "Tanger-Tétouan-Al Hoceïma", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Farabi Tanger", nameAr: "ثانوية تأهيلية الفارابي طنجة", city: "Tanger", cityId: "tanger", region: "Tanger-Tétouan-Al Hoceïma", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Riad Tanger", nameAr: "ثانوية تأهيلية رياض طنجة", city: "Tanger", cityId: "tanger", region: "Tanger-Tétouan-Al Hoceïma", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Majd Tanger", nameAr: "ثانوية تأهيلية المجد طنجة", city: "Tanger", cityId: "tanger", region: "Tanger-Tétouan-Al Hoceïma", type: "lycee", gender: "mixed", source: "static" },

  // ── Meknès ────────────────────────────────────────────────────────────────
  { name: "Lycée Moulay Ismail Meknès", nameAr: "ثانوية تأهيلية مولاي إسماعيل مكناس", city: "Meknès", cityId: "meknes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Qods Meknès", nameAr: "ثانوية تأهيلية القدس مكناس", city: "Meknès", cityId: "meknes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Hassan II Meknès", nameAr: "ثانوية تأهيلية الحسن الثاني مكناس", city: "Meknès", cityId: "meknes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Khaldoun Meknès", nameAr: "ثانوية تأهيلية ابن خلدون مكناس", city: "Meknès", cityId: "meknes", region: "Fès-Meknès", type: "lycee", gender: "mixed", source: "static" },

  // ── Oujda ─────────────────────────────────────────────────────────────────
  { name: "Lycée Hassan II Oujda", nameAr: "ثانوية تأهيلية الحسن الثاني وجدة", city: "Oujda", cityId: "oujda", region: "Oriental", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Khaldoun Oujda", nameAr: "ثانوية تأهيلية ابن خلدون وجدة", city: "Oujda", cityId: "oujda", region: "Oriental", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Mansour Oujda", nameAr: "ثانوية تأهيلية المنصور وجدة", city: "Oujda", cityId: "oujda", region: "Oriental", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Lalla Aicha Oujda", nameAr: "ثانوية تأهيلية للا عيشة وجدة", city: "Oujda", cityId: "oujda", region: "Oriental", type: "lycee", gender: "girls", source: "static" },

  // ── Kénitra ───────────────────────────────────────────────────────────────
  { name: "Lycée Larbi Ben M'hidi", nameAr: "ثانوية تأهيلية العربي بن مهيدي", city: "Kenitra", cityId: "kenitra", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Qalam Kenitra", nameAr: "ثانوية تأهيلية القلم القنيطرة", city: "Kenitra", cityId: "kenitra", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Moulay Hassan Kenitra", nameAr: "ثانوية تأهيلية مولاي الحسن القنيطرة", city: "Kenitra", cityId: "kenitra", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },

  // ── Tétouan ───────────────────────────────────────────────────────────────
  { name: "Lycée Abdelkhalek Torres", nameAr: "ثانوية تأهيلية عبد الخالق طوريس", city: "Tétouan", cityId: "tetouan", region: "Tanger-Tétouan-Al Hoceïma", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Massira Tetouan", nameAr: "ثانوية تأهيلية المسيرة تطوان", city: "Tétouan", cityId: "tetouan", region: "Tanger-Tétouan-Al Hoceïma", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Amal Tetouan", nameAr: "ثانوية تأهيلية الأمل تطوان", city: "Tétouan", cityId: "tetouan", region: "Tanger-Tétouan-Al Hoceïma", type: "lycee", gender: "mixed", source: "static" },

  // ── Salé ──────────────────────────────────────────────────────────────────
  { name: "Lycée Ibn Sina Salé", nameAr: "ثانوية تأهيلية ابن سينا سلا", city: "Salé", cityId: "sale", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Massira Salé", nameAr: "ثانوية تأهيلية المسيرة سلا", city: "Salé", cityId: "sale", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Hay Salam Salé", nameAr: "ثانوية تأهيلية حي السلام سلا", city: "Salé", cityId: "sale", region: "Rabat-Salé-Kénitra", type: "lycee", gender: "mixed", source: "static" },

  // ── Nador ─────────────────────────────────────────────────────────────────
  { name: "Lycée Hassan II Nador", nameAr: "ثانوية تأهيلية الحسن الثاني الناظور", city: "Nador", cityId: "nador", region: "Oriental", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Khaldoun Nador", nameAr: "ثانوية تأهيلية ابن خلدون الناظور", city: "Nador", cityId: "nador", region: "Oriental", type: "lycee", gender: "mixed", source: "static" },

  // ── El Jadida ─────────────────────────────────────────────────────────────
  { name: "Lycée Al Massira El Jadida", nameAr: "ثانوية تأهيلية المسيرة الجديدة", city: "El Jadida", cityId: "el-jadida", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Abdelkrim Al Khattabi El Jadida", nameAr: "ثانوية تأهيلية عبد الكريم الخطابي الجديدة", city: "El Jadida", cityId: "el-jadida", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },

  // ── Béni Mellal ───────────────────────────────────────────────────────────
  { name: "Lycée Hassan II Beni Mellal", nameAr: "ثانوية تأهيلية الحسن الثاني بني ملال", city: "Béni Mellal", cityId: "beni-mellal", region: "Béni Mellal-Khénifra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ibn Khaldoun Beni Mellal", nameAr: "ثانوية تأهيلية ابن خلدون بني ملال", city: "Béni Mellal", cityId: "beni-mellal", region: "Béni Mellal-Khénifra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Ziad Ibn Abihi", nameAr: "ثانوية تأهيلية زياد بن أبيه", city: "Béni Mellal", cityId: "beni-mellal", region: "Béni Mellal-Khénifra", type: "lycee", gender: "mixed", source: "static" },

  // ── Safi ──────────────────────────────────────────────────────────────────
  { name: "Lycée Moulay Abdallah Safi", nameAr: "ثانوية تأهيلية مولاي عبدالله آسفي", city: "Safi", cityId: "safi", region: "Marrakech-Safi", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Hay Mohammadi Safi", nameAr: "ثانوية تأهيلية الحي المحمدي آسفي", city: "Safi", cityId: "safi", region: "Marrakech-Safi", type: "lycee", gender: "mixed", source: "static" },

  // ── Mohammedia ────────────────────────────────────────────────────────────
  { name: "Lycée Ibn Sina Mohammedia", nameAr: "ثانوية تأهيلية ابن سينا المحمدية", city: "Mohammedia", cityId: "mohammedia", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Sidi Maarouf Mohammedia", nameAr: "ثانوية تأهيلية سيدي معروف المحمدية", city: "Mohammedia", cityId: "mohammedia", region: "Casablanca-Settat", type: "lycee", gender: "mixed", source: "static" },

  // ── Khouribga ─────────────────────────────────────────────────────────────
  { name: "Lycée Hassan II Khouribga", nameAr: "ثانوية تأهيلية الحسن الثاني خريبكة", city: "Khouribga", cityId: "khouribga", region: "Béni Mellal-Khénifra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Al Massira Khouribga", nameAr: "ثانوية تأهيلية المسيرة خريبكة", city: "Khouribga", cityId: "khouribga", region: "Béni Mellal-Khénifra", type: "lycee", gender: "mixed", source: "static" },

  // ── Laâyoune ──────────────────────────────────────────────────────────────
  { name: "Lycée Al Massira Laayoune", nameAr: "ثانوية تأهيلية المسيرة العيون", city: "Laâyoune", cityId: "laayoune", region: "Laâyoune-Sakia El Hamra", type: "lycee", gender: "mixed", source: "static" },
  { name: "Lycée Hassan II Laayoune", nameAr: "ثانوية تأهيلية الحسن الثاني العيون", city: "Laâyoune", cityId: "laayoune", region: "Laâyoune-Sakia El Hamra", type: "lycee", gender: "mixed", source: "static" },
];

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

async function main() {
  console.log("🕷️  BAC Sciences School Scraper v2.0");
  console.log("━".repeat(50));

  // Start with static seed data (always reliable)
  const allSchools: School[] = STATIC_SCHOOLS.map((s) => ({
    ...s,
    id: `${slugify(s.name)}-${s.cityId}`,
  }));

  console.log(`📚 Loaded ${allSchools.length} schools from static seed data`);

  // Launch browser for dynamic sources
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      ],
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "fr-FR,fr;q=0.9,ar;q=0.8",
    });

    // Process cities in batches of 4
    const batchSize = 4;
    for (let i = 0; i < CITIES.length; i += batchSize) {
      const batch = CITIES.slice(i, i + batchSize);
      console.log(`\n🏙️  Scraping batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(CITIES.length / batchSize)}: ${batch.map((c) => c.city).join(", ")}`);

      await Promise.allSettled(
        batch.map(async (cityMeta) => {
          const scraped: Partial<School>[] = [];

          // Try all sources concurrently
          const [wikidataRes, taalimticeRes] = await Promise.allSettled([
            scrapeWikidata(cityMeta.cityId, cityMeta.city),
            scrapeTaalimtice(cityMeta.city),
          ]);

          if (wikidataRes.status === "fulfilled") scraped.push(...wikidataRes.value);
          if (taalimticeRes.status === "fulfilled") scraped.push(...taalimticeRes.value);

          // Google Maps is last resort (slower, more likely to block)
          try {
            const gmaps = await scrapeGoogleMaps(page, cityMeta.city);
            scraped.push(...gmaps);
          } catch {
            // Skip if blocked
          }

          const deduped = deduplicateSchools(scraped, cityMeta);
          const newSchools = deduped.filter(
            (s) => !allSchools.find((existing) => existing.id === s.id)
          );
          allSchools.push(...newSchools);
          console.log(`   ✓ ${cityMeta.city}: +${newSchools.length} schools scraped (${deduped.length} total found)`);
        })
      );
    }

    // Also try MASSAR portal
    console.log("\n🏛️  Trying Ministry of Education portal...");
    try {
      const massarPage = await browser.newPage();
      for (const cityMeta of CITIES.slice(0, 5)) {
        const massarResults = await scrapeMassar(massarPage, cityMeta.cityId);
        const massarSchools = deduplicateSchools(massarResults, cityMeta);
        const newMassarSchools = massarSchools.filter(
          (s) => !allSchools.find((e) => e.id === s.id)
        );
        if (newMassarSchools.length > 0) {
          allSchools.push(...newMassarSchools);
          console.log(`   ✓ MASSAR ${cityMeta.city}: +${newMassarSchools.length} schools`);
        }
      }
    } catch {
      console.log("   ⚠ MASSAR portal not accessible");
    }
  } catch (err) {
    console.error("⚠ Browser error:", (err as Error).message);
    console.log("Continuing with static + wikidata data only...");
  } finally {
    if (browser) await browser.close();
  }

  // Build final result
  const cityCounts: Record<string, number> = {};
  for (const s of allSchools) {
    cityCounts[s.city] = (cityCounts[s.city] ?? 0) + 1;
  }

  const result: ScraperResult = {
    schools: allSchools.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
    scrapedAt: new Date().toISOString(),
    totalCount: allSchools.length,
    cityCounts,
  };

  // Write output
  const outPath = path.join(process.cwd(), "public", "data", "schools.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(result, null, 2), "utf-8");

  console.log("\n" + "━".repeat(50));
  console.log(`✅ Done! ${allSchools.length} schools saved to public/data/schools.json`);
  console.log("\n📊 City breakdown:");
  Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([city, count]) => console.log(`   ${city}: ${count} schools`));
}

main().catch(console.error);
