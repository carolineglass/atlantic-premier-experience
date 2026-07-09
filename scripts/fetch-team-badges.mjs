/**
 * One-off/refresh script: downloads club badge images for every team the TC
 * API knows about, from TheSportsDB (free tier, no CORS — hence build-time,
 * not runtime). Saves PNGs to public/images/badges/ and a name -> path map
 * to src/data/team-badges.json. Teams without a match keep their monogram.
 *
 * Run: node scripts/fetch-team-badges.mjs
 * Re-run whenever new teams appear in the API.
 *
 * Note: club crests are trademarked — fine for a demo, review before
 * commercial use.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BADGE_DIR = join(ROOT, 'public/images/badges');
const MAP_FILE = join(ROOT, 'src/data/team-badges.json');
const SEARCH_URL = 'https://www.thesportsdb.com/api/v1/json/3/searchteams.php';
const THROTTLE_MS = 350;

// --- TC API auth + team list ---------------------------------------------

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
);

// The app uses a relative base URL ("/api") that Vite proxies to the sandbox
// (see vite.config.ts); outside Vite we need the real host + /v1 prefix
if (env.VITE_API_BASE_URL.startsWith('/')) {
  env.VITE_API_BASE_URL = 'https://api-sandbox.travelconnectionleisure.com/v1';
}

async function getToken() {
  const res = await fetch(`${env.VITE_API_BASE_URL}/oauthorize/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'password',
      username: env.VITE_API_USERNAME,
      password: env.VITE_API_PASSWORD,
    }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  return (await res.json()).access_token;
}

async function getAllTeams(token) {
  const teams = [];
  let page = 1;
  let lastPage = 1;
  do {
    const res = await fetch(
      `${env.VITE_API_BASE_URL}/teams?page[number]=${page}&page[size]=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`Teams fetch failed: ${res.status}`);
    const data = await res.json();
    teams.push(...data.data);
    lastPage = data.meta.last_page;
    page++;
  } while (page <= lastPage);
  return teams;
}

// --- TheSportsDB lookup ----------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Periods and hyphens break TheSportsDB search ("Paris Saint-Germain" -> no
// results; "Paris Saint Germain" matches)
const normalize = (name) => name.replace(/[.-]/g, ' ').replace(/\s+/g, ' ').trim();

const EXCLUDE = /\b(women|ladies|u1[6-9]|u2[0-3]|reserves)\b|\sB$/i;

async function searchBadge(query) {
  const res = await fetch(`${SEARCH_URL}?t=${encodeURIComponent(query)}`);
  if (res.status === 429) {
    await sleep(15000);
    return searchBadge(query);
  }
  if (!res.ok) return null;
  const data = await res.json();
  const candidates = (data.teams ?? []).filter(
    (t) => t.strSport === 'Soccer' && t.strBadge && !EXCLUDE.test(t.strTeam)
  );
  const exact = candidates.find(
    (t) => normalize(t.strTeam).toLowerCase() === query.toLowerCase()
  );
  return (exact ?? candidates[0])?.strBadge ?? null;
}

async function findBadgeUrl(teamName) {
  const normalized = normalize(teamName);
  const queries = [normalized];
  // Drop leading single-letter abbreviation tokens ("A J Auxerre" -> "Auxerre")
  const noInitials = normalized.replace(/^([A-Za-z]\s+)+/, '');
  if (noInitials && noInitials !== normalized) queries.push(noInitials);
  // Drop a leading short club prefix ("AFC Bournemouth" -> "Bournemouth",
  // "AS Monaco" -> "Monaco", "ACF Fiorentina" -> "Fiorentina")
  const noPrefix = normalized.replace(/^[A-Za-z]{2,4}\s+/, '');
  if (noPrefix && noPrefix !== normalized && !queries.includes(noPrefix)) {
    queries.push(noPrefix);
  }
  // And a trailing one ("Sevilla FC" variants are covered, but e.g.
  // "Como 1907" -> "Como")
  const noSuffix = normalized.replace(/\s+(FC|AFC|CF|SC|AC|BC|SCO|\d{4})$/i, '');
  if (noSuffix && noSuffix !== normalized && !queries.includes(noSuffix)) {
    queries.push(noSuffix);
  }
  for (const q of queries) {
    const url = await searchBadge(q);
    if (url) return url;
    await sleep(THROTTLE_MS);
  }
  return null;
}

// --- Main ------------------------------------------------------------------

const token = await getToken();
const teams = await getAllTeams(token);
console.log(`Fetched ${teams.length} teams from TC API`);

mkdirSync(BADGE_DIR, { recursive: true });
mkdirSync(dirname(MAP_FILE), { recursive: true });

let existing = {};
try {
  existing = JSON.parse(readFileSync(MAP_FILE, 'utf8'));
} catch {
  /* first run */
}

const map = { ...existing };
let found = 0;
let missed = 0;

for (const team of teams) {
  if (map[team.name]) {
    found++;
    continue; // already downloaded on a previous run
  }
  const url = await findBadgeUrl(team.name);
  if (!url) {
    console.log(`  MISS  ${team.name}`);
    missed++;
    await sleep(THROTTLE_MS);
    continue;
  }
  const img = await fetch(url);
  if (!img.ok) {
    console.log(`  MISS  ${team.name} (image ${img.status})`);
    missed++;
    continue;
  }
  const file = `${team.id}.png`;
  writeFileSync(join(BADGE_DIR, file), new Uint8Array(await img.arrayBuffer()));
  map[team.name] = `/images/badges/${file}`;
  found++;
  console.log(`  OK    ${team.name}`);
  await sleep(THROTTLE_MS);
}

writeFileSync(MAP_FILE, JSON.stringify(map, null, 2) + '\n');
console.log(`\nDone: ${found} badges, ${missed} misses -> ${MAP_FILE}`);
