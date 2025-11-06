import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { InventorySync } from '@/lib/inventorySync';
import type { InventoryMap, ProductInventory } from '@/types/product';

/**
 * Hook to get all stored inventory data
 */
export function useInventory() {
  return useQuery<InventoryMap>({
    queryKey: ['inventory'],
    queryFn: () => InventorySync.getStoredInventory(),
    staleTime: 60 * 1000, // Consider stale after 1 minute (matches sync interval)
  });
}

/**
 * Hook to get inventory for a specific product
 */
export function useProductInventory(productId: number) {
  return useQuery<ProductInventory | null>({
    queryKey: ['inventory', productId],
    queryFn: () => InventorySync.getProductInventory(productId),
    staleTime: 60 * 1000, // Consider stale after 1 minute
  });
}

/**
 * Hook to get the lowest price for a product
 */
export function useLowestPrice(productId: number) {
  return useQuery<number | null>({
    queryKey: ['lowestPrice', productId],
    queryFn: () => InventorySync.getLowestPrice(productId),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to check if a product is available
 */
export function useProductAvailability(productId: number) {
  return useQuery<boolean>({
    queryKey: ['availability', productId],
    queryFn: () => InventorySync.isAvailable(productId),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to automatically sync inventory status
 * - Initial sync on mount (if no inventory data exists)
 * - Automatic sync every minute (API recommendation)
 * - Updates React Query cache with fresh data
 *
 * @param productIds - Array of product IDs to sync
 * @param enabled - Whether to enable auto-sync (default: true)
 */
export function useAutoInventorySync(productIds: number[], enabled = true) {
  const queryClient = useQueryClient();
  const syncIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || productIds.length === 0) {
      return;
    }

    console.log('Starting automatic inventory sync...');

    // Run initial sync if no inventory data exists
    const existingInventory = InventorySync.getStoredInventory();
    const hasInventoryData = Object.keys(existingInventory).length > 0;

    if (!hasInventoryData) {
      console.log('No inventory data found - running initial sync...');
      InventorySync.syncInventory(productIds)
        .then((result) => {
          // Update all inventory-related queries
          queryClient.setQueryData(['inventory'], InventorySync.getStoredInventory());

          // Invalidate individual product queries to refresh them
          productIds.forEach((id) => {
            queryClient.invalidateQueries({ queryKey: ['inventory', id] });
            queryClient.invalidateQueries({ queryKey: ['lowestPrice', id] });
            queryClient.invalidateQueries({ queryKey: ['availability', id] });
          });

          console.log('Initial inventory sync complete:', result.message);
        })
        .catch((error: Error) => {
          console.error('Initial inventory sync failed:', error);
        });
    } else {
      console.log(
        `Found inventory data for ${Object.keys(existingInventory).length} products - skipping initial sync`
      );
    }

    // Sync every minute (API recommendation for live pricing)
    syncIntervalRef.current = window.setInterval(() => {
      console.log('Running scheduled inventory sync...');
      InventorySync.syncInventory(productIds)
        .then((result) => {
          // Update all inventory-related queries
          queryClient.setQueryData(['inventory'], InventorySync.getStoredInventory());

          // Invalidate individual product queries to refresh them
          productIds.forEach((id) => {
            queryClient.invalidateQueries({ queryKey: ['inventory', id] });
            queryClient.invalidateQueries({ queryKey: ['lowestPrice', id] });
            queryClient.invalidateQueries({ queryKey: ['availability', id] });
          });

          console.log('Scheduled inventory sync complete:', result.message);
        })
        .catch((error: Error) => {
          console.error('Scheduled inventory sync failed:', error);
        });
    }, 60 * 1000); // 1 minute

    console.log('Auto inventory sync started (interval: 1 minute)');

    // Cleanup on unmount
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      console.log('Auto inventory sync stopped');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.length, enabled]); // Re-run if productIds count or enabled status changes
}
