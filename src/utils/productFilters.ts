import type { Product } from '@/types/product';

/**
 * Filter for upcoming football matches that haven't started yet
 * Used for both display and inventory syncing
 */
export function filterUpcomingMatches(products: Product[]): Product[] {
  return products.filter(
    (product) =>
      product.match.status === 'Upcoming' &&
      product.type === 'football_match' &&
      new Date(product.match.start.local) >= new Date()
  );
}
