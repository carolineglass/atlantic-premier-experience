/**
 * Deterministic monogram styling for teams.
 * The API provides no crests, so each team gets a stable color from a curated
 * palette (hashed from its name) plus a 2-3 letter monogram.
 */

export interface TeamColor {
  bg: string;
  text: string;
}

const PALETTE: TeamColor[] = [
  { bg: '#0C0F14', text: '#FFFFFF' }, // ink
  { bg: '#0C8A3F', text: '#FFFFFF' }, // pitch green
  { bg: '#1D4ED8', text: '#FFFFFF' }, // royal blue
  { bg: '#B91C1C', text: '#FFFFFF' }, // red
  { bg: '#6D28D9', text: '#FFFFFF' }, // violet
  { bg: '#0E7490', text: '#FFFFFF' }, // teal
  { bg: '#C2410C', text: '#FFFFFF' }, // burnt orange
  { bg: '#BE185D', text: '#FFFFFF' }, // magenta
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getTeamColor(name: string): TeamColor {
  return PALETTE[hashName(name) % PALETTE.length];
}

/**
 * Monogram initials for a team name (e.g. "Manchester United" -> "MU",
 * "Arsenal" -> "ARS")
 */
export function getTeamMonogram(name: string): string {
  const words = name
    .replace(/\b(fc|afc|cf|sc|ac)\b/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return name.slice(0, 3).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
