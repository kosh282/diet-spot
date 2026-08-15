import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const text = readFileSync(resolve(".env.local"), "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function tagMatches(selected, values) {
  if (values.includes(selected)) return true;
  return selected === "vegetarian" && values.includes("vegan");
}

function axisMatch(selected, values) {
  return selected.length === 0 || selected.every((tag) => tagMatches(tag, values));
}

function matchesFilters(spot, filters) {
  return (
    axisMatch(filters.diet, spot.diet_tags) &&
    axisMatch(filters.cuisine, spot.cuisine_tags) &&
    axisMatch(filters.venue, spot.venue_tags)
  );
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const jyoti = {
  diet_tags: ["vegetarian", "vegan"],
  cuisine_tags: ["south_asian"],
  venue_tags: ["restaurant"],
};
const kampungku = {
  diet_tags: ["halal"],
  cuisine_tags: ["asian"],
  venue_tags: ["restaurant"],
};

assert(matchesFilters(jyoti, { diet: [], cuisine: [], venue: [] }), "empty filter shows all");
assert(matchesFilters(jyoti, { diet: ["vegan"], cuisine: [], venue: [] }), "vegan matches jyoti");
assert(!matchesFilters(jyoti, { diet: ["halal"], cuisine: [], venue: [] }), "halal does not match jyoti");
assert(
  matchesFilters(kampungku, { diet: ["halal"], cuisine: ["asian"], venue: [] }),
  "AND across axes",
);
assert(
  !matchesFilters(kampungku, { diet: ["halal"], cuisine: ["korean"], venue: [] }),
  "AND fails when cuisine missing",
);
assert(
  matchesFilters(jyoti, { diet: ["vegetarian", "vegan"], cuisine: [], venue: [] }),
  "AND within diet when spot has both",
);
assert(
  !matchesFilters(jyoti, { diet: ["halal", "vegan"], cuisine: [], venue: [] }),
  "AND within diet fails when one tag is missing",
);

const veganOnly = {
  diet_tags: ["vegan"],
  cuisine_tags: ["dessert"],
  venue_tags: ["cafe"],
};
const vegetarianOnly = {
  diet_tags: ["vegetarian"],
  cuisine_tags: ["dessert"],
  venue_tags: ["cafe"],
};
assert(matchesFilters(veganOnly, { diet: ["vegetarian"], cuisine: [], venue: [] }), "vegetarian filter includes vegan");
assert(!matchesFilters(vegetarianOnly, { diet: ["vegan"], cuisine: [], venue: [] }), "vegan filter does not include vegetarian-only");

const env = loadEnv();
const failures = [];

const home = await fetch("http://localhost:3000");
if (!home.ok) failures.push(`homepage ${home.status}`);
const html = await home.text();
if (!html.includes("DietSpot") && !html.includes("__next")) {
  failures.push("homepage html missing app shell");
}

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  failures.push("supabase env missing");
} else {
  const spotsRes = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/spots?select=name,source,diet_tags`, {
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  if (!spotsRes.ok) {
    failures.push(`spots select ${spotsRes.status} ${await spotsRes.text()}`);
  } else {
    const rows = await spotsRes.json();
    console.log(`db spots: ${rows.length}`);
    console.log(rows.map((row) => row.name).join(", ") || "(empty — login once or run 0002 SQL)");
  }
}

if (failures.length) {
  console.error("FAIL");
  for (const item of failures) console.error("-", item);
  process.exit(1);
}

console.log("filter rules: ok");
console.log("homepage: ok");
console.log("supabase select: ok");
