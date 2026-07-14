import teamStadiums from '@/data/team-stadiums.json';

export interface StadiumImage {
  /** 480px WebP for card headers */
  card: string;
  /** 960px WebP for the event-page hero */
  hero: string;
  credit: string;
  license: string;
}

const MAP: Record<string, StadiumImage> = teamStadiums;

/**
 * Freely-licensed home-stadium photo for a team, fetched at build time from
 * Wikimedia Commons by scripts/fetch-stadium-images.mjs. CC licenses require
 * the credit to be displayed near the image. Returns undefined when no photo
 * exists (UI falls back to typography).
 */
export function getStadiumImage(
  teamName: string | undefined
): StadiumImage | undefined {
  if (!teamName) return undefined;
  return MAP[teamName];
}
