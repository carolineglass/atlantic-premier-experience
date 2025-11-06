import { apiClient } from '@/api/client';
import type {
  InventoryStatusRequest,
  InventoryStatusResponse,
  InventoryMap,
  InventorySyncResult,
  ProductInventory,
} from '@/types/product';
import { StorageService } from './storage.service';

const STORAGE_KEYS = {
  INVENTORY: 'tc_inventory',
  LAST_INVENTORY_SYNC: 'tc_last_inventory_sync',
};

/**
 * InventorySync class - manages real-time ticket pricing and availability
 * Follows TC API recommendation: sync every minute for live pricing
 */
export class InventorySync {
  /**
   * Fetch inventory status for multiple products (up to 100 per request)
   * Returns ticket categories with live pricing and availability
   */
  static async syncInventory(productIds: number[]): Promise<InventorySyncResult> {
    if (productIds.length === 0) {
      return {
        success: true,
        productsUpdated: 0,
        message: 'No products to sync',
        timestamp: new Date(),
      };
    }

    console.log(`Fetching inventory for ${productIds.length} products...`);

    try {
      // Split into batches of 100 (API limit)
      const batches = this.chunkArray(productIds, 100);
      const allInventoryData: ProductInventory[] = [];

      for (const batch of batches) {
        const requestBody: InventoryStatusRequest = {
          products: batch,
        };

        const response: InventoryStatusResponse = await apiClient.post(
          '/inventory-status',
          requestBody
        );

        allInventoryData.push(...response.data);
        console.log(`Fetched inventory for batch of ${batch.length} products`);
      }

      // Convert array to map for quick lookups by product ID
      const inventoryMap: InventoryMap = {};
      allInventoryData.forEach((inventory) => {
        inventoryMap[inventory.id] = inventory;
      });

      // Store in localStorage
      StorageService.set(STORAGE_KEYS.INVENTORY, inventoryMap);
      StorageService.setTimestamp(STORAGE_KEYS.LAST_INVENTORY_SYNC);

      console.log(
        `Successfully synced inventory for ${allInventoryData.length} products`
      );

      return {
        success: true,
        productsUpdated: allInventoryData.length,
        message: `Synced inventory for ${allInventoryData.length} products`,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to fetch inventory status:', error);

      return {
        success: false,
        productsUpdated: 0,
        message: 'Failed to fetch inventory status',
        timestamp: new Date(),
        error: errorMessage,
      };
    }
  }

  /**
   * Get stored inventory map from localStorage
   */
  static getStoredInventory(): InventoryMap {
    return StorageService.get<InventoryMap>(STORAGE_KEYS.INVENTORY) ?? {};
  }

  /**
   * Get inventory for a specific product
   */
  static getProductInventory(productId: number): ProductInventory | null {
    const inventoryMap = this.getStoredInventory();
    return inventoryMap[productId] ?? null;
  }

  /**
   * Get the lowest price for a product from available ticket options
   */
  static getLowestPrice(productId: number): number | null {
    const inventory = this.getProductInventory(productId);
    if (!inventory || inventory.ticket_options.length === 0) {
      return null;
    }

    // Only consider available tickets
    const availableTickets = inventory.ticket_options.filter(
      (option) => option.available
    );

    if (availableTickets.length === 0) {
      return null;
    }

    return Math.min(...availableTickets.map((option) => option.price));
  }

  /**
   * Check if a product has any available tickets
   */
  static isAvailable(productId: number): boolean {
    const inventory = this.getProductInventory(productId);
    if (!inventory) {
      return false;
    }

    // Check if any ticket options are available
    return inventory.ticket_options.some((option) => option.available);
  }

  /**
   * Get last inventory sync timestamp
   */
  static getLastSync(): Date | null {
    return StorageService.getTimestamp(STORAGE_KEYS.LAST_INVENTORY_SYNC);
  }

  /**
   * Clear stored inventory data
   */
  static clearInventory(): void {
    StorageService.remove(STORAGE_KEYS.INVENTORY);
    StorageService.remove(STORAGE_KEYS.LAST_INVENTORY_SYNC);
    console.log('Cleared inventory data from localStorage');
  }

  /**
   * Helper to split array into chunks
   */
  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
