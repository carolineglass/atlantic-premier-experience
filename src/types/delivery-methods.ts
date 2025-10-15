// DELIVERY METHODS LIST RESPONSE (GET /delivery-methods)
// Note: Safe to cache for extended time (changes rarely)

export interface DeliveryMethodsResponse {
  data: DeliveryMethod[];
}

export interface DeliveryMethod {
  id: number;
  name: string;
  description: string;
  price: string;
  requires_delivery: boolean;
}

// DELIVERY METHOD DETAIL RESPONSE (GET /delivery-methods/{id})
// Note: Safe to cache for extended time (changes rarely)

export interface DeliveryMethodDetailResponse {
  data: DeliveryMethod;
}

// QUERY PARAMS FOR /delivery-methods

export interface DeliveryMethodsQueryParams {
  page?: {
    number?: number;
    size?: number;
  };
}
