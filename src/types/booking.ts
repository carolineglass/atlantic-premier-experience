// RESERVATIONS + ORDERS (booking flow)
// Schemas mirror the TC OpenAPI spec at docs.travelconnectionleisure.com.
// Recommended flow: POST /reservations when tickets enter the cart (holds
// them until expires_at), then POST /reservations/{number}/confirm with
// guest details to place the booking. No card payment in the API — orders
// land as "pending payment" and are settled by agent invoice.

// POST /reservations

export interface CreateReservationRequest {
  agent_reference?: string;
  products: ReservationRequestProduct[];
}

export interface ReservationRequestProduct {
  /** Ticket option ID from the inventory endpoint */
  ticket_option: number;
  quantity: number;
}

export interface ReservationResponse {
  data: ReservationResource;
}

export interface ReservationResource {
  reservation_num: string;
  /** UNIX epoch seconds */
  created_at: number;
  status: string;
  agent_reference: string | null;
  price_total: number;
  /** UNIX epoch seconds — tickets are released after this (sandbox: 10 min) */
  expires_at: number;
  currency: string;
  products: ReservationProduct[];
}

export interface ReservationProduct {
  id: number;
  /** UNIX epoch seconds */
  tour_date: number;
  name: string;
  ticket_option: string;
  ticket_option_id: number;
  delivery_method: string;
  qty: number;
  total: number;
  currency: string;
}

// POST /reservations/{number}/confirm

export interface ConfirmReservationRequest {
  agent_reference?: string;
  guests: ReservationGuest[];
}

export interface ReservationGuest {
  first_name: string;
  last_name: string;
  /** Which ticket option this guest's ticket belongs to */
  ticket_option_id: number;
  /** Exactly one guest should be the lead booker */
  lead: boolean;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
}

export interface ConfirmReservationResponse {
  order: OrderConfirmation;
}

export interface OrderConfirmation {
  order_no: string;
  total: string | number;
  currency: string;
  status: 'confirmed';
}

// POST /orders (direct booking, bypassing reservations)
// Used as a fallback: the sandbox's reservations/{number}/confirm endpoint
// reliably redirects (never returns JSON) whenever the reservation spans
// more than one ticket category, even though direct multi-category orders
// work fine. Confirmed by isolated testing against the live sandbox.

export interface CreateOrderRequest {
  order: {
    agent_reference?: string | null;
    products: OrderRequestProduct[];
  };
}

export interface OrderRequestProduct {
  product_id: number;
  quantity: number;
  ticket_option: number;
  delivery_method: number;
  guests: OrderRequestGuest[];
}

export interface OrderRequestGuest {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
}

export interface CreateOrderResponse {
  order: OrderConfirmation;
}
