// PRODUCT LIST RESPONSE (/product)

export interface ProductsResponse {
  data: Product[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface Product {
  id: number;
  name: string;
  type: string;
  slug: string;
  match: Match;
  event: EventData | null;
  min_order: number;
  max_order: number;
  venue: number;
  event_dates: string[];
  images: ProductImages;
  seating_plan: null;
}

export interface Match {
  start: MatchStart;
  time_confirmed: string;
  home: number;
  away: number;
  competition: number;
  status: 'Expired' | 'Upcoming';
}

export interface MatchStart {
  tz: string;
  local: string;
  utc: string;
  epoch: number;
}

export interface ProductImages {
  main: string | null;
  thumb: string | null;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: MetaLink[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface MetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

// PRODUCT DETAIL RESPONSE (/product/{id})

export interface ProductDetailResponse {
  data: ProductDetail;
}

export interface ProductDetail {
  id: number;
  name: string;
  type: string;
  slug: string;
  match: Match;
  event: EventData | null;
  min_order: number;
  max_order: number;
  venue: number;
  event_dates: string[];
  images: ProductImages;
  information: string;
  notes: string;
  timetable: string;
  currency: string;
  categories: Category[];
  seating_plan: SeatingPlan[];
}

export interface EventData {
  event: EventInfo;
  event_dates: string;
}

export interface EventInfo {
  start: MatchStart;
  end: MatchStart;
  status: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface SeatingPlan {
  image: string;
  category_map: CategoryMap[];
}

export interface CategoryMap {
  ticket_category_id: number;
  path_ids: number[];
}

// UPCOMING PRODUCTS RESPONSE (/product/upcoming)

export interface UpcomingProductsResponse {
  data: UpcomingProduct[];
}

export interface UpcomingProduct {
  id: number;
  type: string;
  name: string;
  date: string;
  updated_on: string;
}

// QUERY PARAMS FOR /product

export interface ProductQueryParams {
  type?: 'football_match' | 'event';
  search?: string;
  modified_since?: number; // UNIX timestamp
  include_completed?: boolean;
  is_confirmed?: boolean;
  venue?: string | number | (string | number)[]; // Can be array or single ID
  competition?: string | number | (string | number)[]; // Can be array or single ID
  start_date?: string | number; // UNIX timestamp, YYYY-MM-DD, or YYYY-MM-DD HH:MM:SS
  end_date?: string | number; // UNIX timestamp, YYYY-MM-DD, or YYYY-MM-DD HH:MM:SS
  team?: string | number | (string | number)[]; // Can be array or single ID
  page?: {
    number?: number;
    size?: number;
  };
}

// INVENTORY STATUS RESPONSE (POST /inventory-status)

export interface InventoryStatusRequest {
  products: number[];
}

export interface InventoryStatusResponse {
  data: ProductInventory[];
}

export interface ProductInventory {
  id: number;
  status: 'Expired' | 'Upcoming';
  ticket_options: TicketOption[];
}

export interface TicketOption {
  id: number;
  ticket_category: number;
  name: string;
  price: number;
  available: boolean;
  max_purchase_qty: number;
  delivery_methods: number[];
}

// Stored inventory map for quick lookups by product ID
export interface InventoryMap {
  [productId: number]: ProductInventory;
}

export interface InventorySyncResult {
  success: boolean;
  productsUpdated: number;
  message: string;
  timestamp: Date;
  error?: string;
}
