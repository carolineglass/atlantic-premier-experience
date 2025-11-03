import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { ProductSync, type SyncResult } from '@/lib/productSync';
import type { Product } from '@/types/product';

/**
 * Hook to get products from localStorage
 */
export function useStoredProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => ProductSync.getStoredProducts(),
    staleTime: Infinity, // Don't refetch, we control sync manually
  });
}

/**
 * Hook to manually fetch products from API and sync to localStorage
 */
export function useProductSync() {
  const queryClient = useQueryClient();

  return useMutation<SyncResult>({
    mutationFn: () => ProductSync.syncProducts(),
    onSuccess: (result) => {
      // Update the products query cache
      queryClient.setQueryData(['products'], result.products);
      console.log('Products synced:', result.message);
    },
    onError: (error) => {
      console.error('Sync failed:', error);
    },
  });
}

/**
 * Hook to automatically sync products following API recommendations
 * - Initial sync on mount (if localStorage is empty)
 * - Hourly product sync (using modified_since for efficiency)
 * - Daily static data sync
 *
 * Automatically starts when component mounts and stops when it unmounts
 */
export function useAutoProductSync() {
  const queryClient = useQueryClient();
  const syncIntervalRef = useRef<number | null>(null);
  const staticIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    console.log('Starting automatic sync schedule...');

    // Run initial sync if no products in localStorage
    const existingProducts = ProductSync.getStoredProducts();
    if (existingProducts.length === 0) {
      console.log('No products in localStorage - running initial sync...');
      ProductSync.syncProducts()
        .then((result: SyncResult) => {
          // Update React Query cache with the synced products
          queryClient.setQueryData(['products'], result.products);
          console.log('Initial sync complete:', result.message);
        })
        .catch((error: Error) => {
          console.error('Initial product sync failed:', error);
        });
    } else {
      console.log(
        `Found ${existingProducts.length} products in localStorage - skipping initial sync`
      );
    }

    // Product sync: Every hour (API recommendation)
    syncIntervalRef.current = window.setInterval(
      () => {
        console.log('Hourly product sync...');
        ProductSync.syncProducts()
          .then((result: SyncResult) => {
            queryClient.setQueryData(['products'], result.products);
            console.log('Scheduled sync complete:', result.message);
          })
          .catch((error: Error) => {
            console.error('Scheduled product sync failed:', error);
          });
      },
      60 * 60 * 1000
    ); // 1 hour

    // Static data sync: Once per day (API recommendation)
    staticIntervalRef.current = window.setInterval(
      () => {
        console.log('Daily static data sync...');
        ProductSync.syncStaticData().catch((error: Error) =>
          console.error('Static data sync failed:', error)
        );
      },
      24 * 60 * 60 * 1000
    ); // 24 hours

    console.log('Auto-sync started (products: hourly, static data: daily)');

    // Cleanup on unmount
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (staticIntervalRef.current) {
        clearInterval(staticIntervalRef.current);
      }
      console.log('Auto-sync stopped');
    };
  }, []); // queryClient is stable, no need to include in deps
}
