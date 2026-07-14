/**
 * Deterministic accent assignment so recurring entities (competitions,
 * teams) always wear the same pop of color across the site.
 * Class strings must stay complete literals so Tailwind's scanner sees them.
 */

export interface Accent {
  chip: string;
  dot: string;
}

const ACCENTS: Accent[] = [
  { chip: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  { chip: 'bg-ocean-50 text-ocean-700', dot: 'bg-ocean-500' },
  { chip: 'bg-tangerine-50 text-tangerine-700', dot: 'bg-tangerine-500' },
  { chip: 'bg-gold-50 text-gold-700', dot: 'bg-gold-500' },
];

export function getAccent(key: string | number): Accent {
  // Numeric keys (competition/team ids) are dense, so straight modulo gives
  // a much better spread than string hashing — neighboring ids differ
  if (typeof key === 'number') {
    return ACCENTS[Math.abs(key) % ACCENTS.length];
  }
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}
