/**
 * Fetches freely-licensed home-stadium photos for TC teams from Wikimedia
 * Commons (club -> Wikidata home venue P115 -> image P18), recording author
 * and license for the attribution requirements of CC BY / CC BY-SA.
 *
 * Saves two WebP sizes per team (480px for cards, 960px for the event hero)
 * to public/images/stadiums/ and a map to src/data/team-stadiums.json:
 * { [teamName]: { card, hero, credit, license } }.
 * Teams without a usable photo are skipped (UI falls back to typography).
 *
 * Run all teams:      node scripts/fetch-stadium-images.mjs
 * Run a sample:       node scripts/fetch-stadium-images.mjs "Celtic FC" "Arsenal"
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = join(ROOT, 'public/images/stadiums');
const MAP_FILE = join(ROOT, 'src/data/team-stadiums.json');
const UA = {
  'User-Agent':
    'AtlanticPremierExperience/1.0 (stadium image fetcher; carolineglass89@gmail.com)',
};
const THROTTLE_MS = 400;
const IMG_WIDTH = 1280;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return null;
  return res.json();
}

// --- TC API team list (same auth flow as fetch-team-badges) ---------------

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
);
if (env.VITE_API_BASE_URL.startsWith('/')) {
  env.VITE_API_BASE_URL = 'https://api-sandbox.travelconnectionleisure.com/v1';
}

async function getAllTeams() {
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
  const token = (await res.json()).access_token;

  const teams = [];
  let page = 1;
  let lastPage = 1;
  do {
    const data = await (
      await fetch(
        `${env.VITE_API_BASE_URL}/teams?page[number]=${page}&page[size]=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    ).json();
    teams.push(...data.data);
    lastPage = data.meta.last_page;
    page++;
  } while (page <= lastPage);
  return teams;
}

// --- Wikidata / Commons lookups --------------------------------------------

async function findClubEntity(name) {
  const variants = [
    name,
    name.replace(/[.-]/g, ' ').replace(/\s+/g, ' ').trim(),
    `${name} football club`,
  ];
  for (const q of variants) {
    const data = await getJson(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&format=json&type=item&limit=1`
    );
    const id = data?.search?.[0]?.id;
    if (id) return id;
    await sleep(THROTTLE_MS);
  }
  return null;
}

async function getStadiumImageFile(clubId) {
  const entity = await getJson(
    `https://www.wikidata.org/wiki/Special:EntityData/${clubId}.json`
  );
  const claims = entity?.entities?.[clubId]?.claims;
  const venueId = claims?.P115?.[0]?.mainsnak?.datavalue?.value?.id;
  if (!venueId) return null;
  const venue = await getJson(
    `https://www.wikidata.org/wiki/Special:EntityData/${venueId}.json`
  );
  return (
    venue?.entities?.[venueId]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value ??
    null
  );
}

async function getLicenseInfo(fileName) {
  const data = await getJson(
    `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${fileName}`)}&prop=imageinfo&iiprop=extmetadata&format=json`
  );
  const pages = data?.query?.pages ?? {};
  const meta = Object.values(pages)[0]?.imageinfo?.[0]?.extmetadata;
  if (!meta) return null;
  const strip = (html) => (html ?? '').replace(/<[^>]*>/g, '').trim();
  return {
    credit: strip(meta.Artist?.value) || 'Wikimedia Commons',
    license: strip(meta.LicenseShortName?.value) || 'unknown',
  };
}

// --- Main -------------------------------------------------------------------

const onlyNames = process.argv.slice(2);
const teams = await getAllTeams();
const targets = onlyNames.length
  ? teams.filter((t) => onlyNames.includes(t.name))
  : teams;
console.log(`Fetching stadium photos for ${targets.length} teams…`);

mkdirSync(IMG_DIR, { recursive: true });
mkdirSync(dirname(MAP_FILE), { recursive: true });

let map = {};
try {
  map = JSON.parse(readFileSync(MAP_FILE, 'utf8'));
} catch {
  /* first run */
}

let ok = 0;
let miss = 0;
for (const team of targets) {
  if (map[team.name]) {
    ok++;
    continue;
  }
  try {
    const clubId = await findClubEntity(team.name);
    const file = clubId ? await getStadiumImageFile(clubId) : null;
    if (!file || /\.(svg|pdf|tiff?)$/i.test(file)) {
      console.log(`  MISS  ${team.name}`);
      miss++;
      await sleep(THROTTLE_MS);
      continue;
    }
    const imgRes = await fetch(
      `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${IMG_WIDTH}`,
      { headers: UA, redirect: 'follow' }
    );
    if (!imgRes.ok) {
      console.log(`  MISS  ${team.name} (download ${imgRes.status})`);
      miss++;
      continue;
    }
    const license = (await getLicenseInfo(file)) ?? {
      credit: 'Wikimedia Commons',
      license: 'unknown',
    };
    const source = Buffer.from(await imgRes.arrayBuffer());
    await sharp(source)
      .resize({ width: 960, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(join(IMG_DIR, `${team.id}-960.webp`));
    await sharp(source)
      .resize({ width: 480, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(join(IMG_DIR, `${team.id}-480.webp`));
    map[team.name] = {
      card: `/images/stadiums/${team.id}-480.webp`,
      hero: `/images/stadiums/${team.id}-960.webp`,
      credit: license.credit,
      license: license.license,
    };
    ok++;
    console.log(`  OK    ${team.name} (${license.license})`);
    await sleep(THROTTLE_MS);
  } catch (e) {
    console.log(`  ERR   ${team.name}: ${String(e).slice(0, 60)}`);
    miss++;
  }
}

writeFileSync(MAP_FILE, JSON.stringify(map, null, 2) + '\n');
console.log(`\nDone: ${ok} photos, ${miss} misses -> ${MAP_FILE}`);
