import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { ProductsResponse, ProductQueryParams } from '@/types/product';

/**
 * Fetch products list with optional filters
 */
export function useProducts(params?: ProductQueryParams) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: () =>
      apiClient.get('/product', { params: params as Record<string, unknown> }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: string | number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.get(`/product/${id}`),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
