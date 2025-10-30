import { apiClient } from '@/api/client';
import type { ProductsResponse, Product } from '@/types/product';
import { StorageService } from './storage.service';

const STORAGE_KEYS = {
  PRODUCTS: 'tc_products',
  LAST_SYNC: 'tc_last_sync',
};

/**
 * Result of a sync operation
 */
export interface SyncResult {
  success: boolean;
  products: Product[];
  message: string;
  error?: string;
  isIncremental?: boolean;
}

/**
 * ProductSync class - fetches products from API with pagination support
 * Follows TC API recommendations: initial full crawl, then incremental updates using modified_since
 */
export class ProductSync {
  /**
   * Fetch all products from the API with pagination and save to localStorage
   * Uses modified_since parameter for incremental updates after initial sync
   */
  static async syncProducts(): Promise<SyncResult> {
    console.log('Fetching products from API...');

    try {
      const lastSync = StorageService.getTimestamp(STORAGE_KEYS.LAST_SYNC);
      const isIncremental = lastSync !== null;

      // If we have a last sync time, only get modified products
      const modifiedSince = lastSync
        ? Math.floor(lastSync.getTime() / 1000)
        : undefined;

      const allProducts: Product[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Fetch all pages
      while (hasMorePages) {
        const response: ProductsResponse = await apiClient.get('/product', {
          params: {
            ...(modifiedSince && { modified_since: modifiedSince }),
            page: {
              number: currentPage,
              size: 100,
            },
          },
        });

        allProducts.push(...response.data);

        // Check if there are more pages
        hasMorePages = response.meta.current_page < response.meta.last_page;
        currentPage++;

        console.log(
          `Fetched page ${response.meta.current_page}/${response.meta.last_page} (${response.data.length} products)`
        );
      }

      // If incremental sync, merge with existing products
      let finalProducts: Product[];
      if (isIncremental && allProducts.length > 0) {
        const existingProducts = this.getStoredProducts();
        const productMap = new Map(existingProducts.map((p) => [p.id, p]));

        // Update or add new products
        allProducts.forEach((product) => {
          productMap.set(product.id, product);
        });

        finalProducts = Array.from(productMap.values());
        console.log(
          `Incremental sync: ${allProducts.length} updated/new products, ${finalProducts.length} total`
        );
      } else if (!isIncremental) {
        // First sync - use all fetched products
        finalProducts = allProducts;
        console.log(`Full sync: ${finalProducts.length} products`);
      } else {
        // Incremental sync but no new products - keep existing
        finalProducts = this.getStoredProducts();
        console.log('No new products found in incremental sync');
      }

      // Only save if we have products OR if this is a successful incremental update
      if (finalProducts.length > 0) {
        StorageService.set(STORAGE_KEYS.PRODUCTS, finalProducts);
        StorageService.setTimestamp(STORAGE_KEYS.LAST_SYNC);
        console.log(`Successfully saved ${finalProducts.length} products`);
      } else {
        console.warn('No products to save - skipping localStorage update');
      }

      return {
        success: finalProducts.length > 0 || isIncremental,
        products: finalProducts,
        message: isIncremental
          ? allProducts.length > 0
            ? `Incremental sync: ${allProducts.length} new/updated products (${finalProducts.length} total)`
            : 'No new products since last sync'
          : finalProducts.length > 0
            ? `Full sync: ${finalProducts.length} products`
            : 'No products found',
        isIncremental,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to fetch products:', error);

      return {
        success: false,
        products: this.getStoredProducts(),
        message: 'Failed to fetch products',
        error: errorMessage,
      };
    }
  }

  /**
   * Get stored products from localStorage
   */
  static getStoredProducts(): Product[] {
    return StorageService.get<Product[]>(STORAGE_KEYS.PRODUCTS) ?? [];
  }

  /**
   * Get last sync timestamp
   */
  static getLastSync(): Date | null {
    return StorageService.getTimestamp(STORAGE_KEYS.LAST_SYNC);
  }

  /**
   * Clear stored products and sync history
   * Use this to reset and force a full sync on next load
   */
  static clearProducts(): void {
    StorageService.remove(STORAGE_KEYS.PRODUCTS);
    StorageService.remove(STORAGE_KEYS.LAST_SYNC);
    console.log('Cleared products and sync history from localStorage');
  }

  /**
   * Sync static data (teams, venues, competitions, delivery methods)
   * Recommended: Run once per day
   */
  static async syncStaticData(): Promise<void> {
    console.log('Syncing static data...');
    // TODO: Implement when needed
    // const teams = await apiClient.get('/teams');
    // const venues = await apiClient.get('/venues');
    // const competitions = await apiClient.get('/competitions');
    // const deliveryMethods = await apiClient.get('/delivery-methods');
    // StorageService.set('tc_static_data', { teams, venues, competitions, deliveryMethods });
    console.log('Static data sync not yet implemented');
  }

  /**
   * Start automatic syncing based on API recommendations
   * - Products: Every hour (using modified_since for efficiency)
   * - Static data: Once per day
   *
   * Only runs initial sync if localStorage is empty (first-time users)
   * On page refresh, loads from localStorage instantly (no API call)
   *
   * Returns a cleanup function to stop syncing
   */
  static startAutoSync(): () => void {
    console.log('Starting automatic sync schedule...');

    // Only run initial sync if we have no products in localStorage
    const existingProducts = this.getStoredProducts();
    if (existingProducts.length === 0) {
      console.log('No products in localStorage - running initial sync...');
      this.syncProducts().catch((error) =>
        console.error('Initial product sync failed:', error)
      );
    } else {
      console.log(
        `Found ${existingProducts.length} products in localStorage - skipping initial sync`
      );
    }

    // Product sync: Every hour (API recommendation)
    const productInterval = setInterval(
      () => {
        console.log('Hourly product sync...');
        this.syncProducts().catch((error) =>
          console.error('Scheduled product sync failed:', error)
        );
      },
      60 * 60 * 1000
    ); // 1 hour

    // Static data sync: Once per day (API recommendation)
    const staticInterval = setInterval(
      () => {
        console.log('Daily static data sync...');
        this.syncStaticData().catch((error) =>
          console.error('Static data sync failed:', error)
        );
      },
      24 * 60 * 60 * 1000
    ); // 24 hours

    console.log('Auto-sync started (products: hourly, static data: daily)');

    // Return cleanup function to stop all intervals
    return () => {
      clearInterval(productInterval);
      clearInterval(staticInterval);
      console.log('Auto-sync stopped');
    };
  }
}
