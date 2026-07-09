import type { Product } from '@/types/product';

/**
 * Filter for upcoming football matches that haven't started yet
 * Used for both display and inventory syncing
 */
export function filterUpcomingMatches(products: Product[]): Product[] {
  return products.filter(
    (product) =>
      product.type === 'football_match' &&
      product.match != null &&
      product.match.status === 'Upcoming' &&
      new Date(product.match.start.local) >= new Date()
  );
}

/**
 * Filter matches by competition ID
 */
export function filterByCompetition(
  products: Product[],
  competitionId: number
): Product[] {
  return products.filter(
    (product) => product.match.competition === competitionId
  );
}

/**
 * Filter matches where the given team plays (home or away)
 */
export function filterByTeam(products: Product[], teamId: number): Product[] {
  return products.filter(
    (product) => product.match.home === teamId || product.match.away === teamId
  );
}

/**
 * Filter matches within a date range (inclusive). Either bound may be omitted.
 */
export function filterByDateRange(
  products: Product[],
  from?: Date,
  to?: Date
): Product[] {
  return products.filter((product) => {
    const start = new Date(product.match.start.local);
    if (from && start < from) return false;
    if (to && start > to) return false;
    return true;
  });
}

/**
 * Sort matches by kickoff date, soonest first
 */
export function sortByKickoff(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) =>
      new Date(a.match.start.local).getTime() -
      new Date(b.match.start.local).getTime()
  );
}
