// TEAMS ENDPOINTS

/**
 * GET /teams - List all teams
 * Query params:
 * - family?: number - Family (category) ID
 * - name?: string - Search for a team by its name
 * - page?: { number?: number, size?: number }
 */
export interface TeamsResponse {
  data: Team[];
}

/**
 * GET /teams/{id} - Get team by ID
 */
export interface TeamResponse {
  data: Team;
}

export interface Team {
  id: number;
  name: string;
}

export interface TeamsQueryParams {
  family?: number;
  name?: string;
  page?: {
    number?: number;
    size?: number;
  };
}

// VENUES ENDPOINTS

/**
 * GET /venues - List all venues
 * Query params:
 * - country?: number - Country ID
 * - name?: string - Search for a venue by its name
 * - type?: 'football_match' | 'event' - Product type
 * - page?: { number?: number, size?: number }
 */
export interface VenuesResponse {
  data: Venue[];
}

/**
 * GET /venues/{id} - Get venue by ID
 */
export interface VenueResponse {
  data: Venue;
}

export interface Venue {
  id: number;
  name: string;
  address: string | null;
  description: string | null;
  coordinates: VenueCoordinates;
  postcode: string;
  city: string;
  country: string;
  images: VenueImages;
}

export interface VenueCoordinates {
  lat: string;
  lng: string;
}

export interface VenueImages {
  stadium: string | null;
  seating: string;
}

export interface VenuesQueryParams {
  country?: number;
  name?: string;
  type?: 'football_match' | 'event';
  page?: {
    number?: number;
    size?: number;
  };
}

// COMPETITIONS ENDPOINTS

/**
 * GET /competitions - List all competitions
 * Note: No query parameters documented
 */
export interface CompetitionsResponse {
  data: Competition[];
}

/**
 * GET /competitions/{id} - Get competition by ID
 */
export interface CompetitionResponse {
  data: Competition;
}

export interface Competition {
  id: number;
  name: string;
}

// COUNTRIES ENDPOINTS

/**
 * GET /countries - List all countries
 * Note: These values are static and never change - can cache indefinitely
 */
export interface CountriesResponse {
  data: Country[];
}

export interface Country {
  id: number;
  code: string; // ISO Code
  name: string;
}

// TICKET CATEGORIES ENDPOINTS

/**
 * GET /ticket-categories - List all ticket categories
 * Query params:
 * - venue?: string - Venue ID
 * - page?: { number?: number, size?: number }
 *
 * Note: Ticket category information may be updated - cache for up to one day
 */
export interface TicketCategoriesResponse {
  data: TicketCategory[];
}

export interface TicketCategory {
  id: number;
  product_type: string;
  venue: number;
  name: string;
  description: string;
  consumer_info: string;
  color: string;
  delivery_methods: number[];
}

export interface TicketCategoriesQueryParams {
  venue?: string;
  page?: {
    number?: number;
    size?: number;
  };
}

// DELIVERY METHODS ENDPOINTS

/**
 * GET /delivery-methods - List all delivery methods
 * Query params:
 * - page?: { number?: number, size?: number }
 *
 * Note: Delivery methods change very rarely and can be cached for an extended time
 */
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

export interface DeliveryMethodsQueryParams {
  page?: {
    number?: number;
    size?: number;
  };
}

// STATIC DATA STORAGE (combined for localStorage)

export interface StaticData {
  teams: Team[];
  venues: Venue[];
  competitions: Competition[];
  countries: Country[];
  ticketCategories: TicketCategory[];
  deliveryMethods: DeliveryMethod[];
  lastSync?: number; // UNIX timestamp
}
