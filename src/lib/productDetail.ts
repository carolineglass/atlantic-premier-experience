import { apiClient } from '@/api/client';
import type { ProductDetailResponse, ProductDetail } from '@/types/product';

/**
 * Service for fetching individual product details
 */
export class ProductDetailService {
  /**
   * Fetch full product details by ID
   */
  static async getProductDetail(productId: number): Promise<ProductDetail> {
    try {
      const response = await apiClient.get<ProductDetailResponse>(
        `/product/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error);
      throw error;
    }
  }
}
