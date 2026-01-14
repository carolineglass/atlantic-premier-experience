import { useQuery } from '@tanstack/react-query';
import { ProductDetailService } from '@/lib/productDetail';
import type { ProductDetail } from '@/types/product';

/**
 * Hook to fetch full product details by ID
 */
export function useProductDetail(productId: number | undefined) {
  return useQuery<ProductDetail>({
    queryKey: ['productDetail', productId],
    queryFn: () => {
      if (!productId) throw new Error('Product ID is required');
      return ProductDetailService.getProductDetail(productId);
    },
    enabled: productId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
