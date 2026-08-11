import { apiClient } from './client';
import type {
  CreateReservationRequest,
  ReservationResponse,
  ReservationResource,
  ConfirmReservationRequest,
  ConfirmReservationResponse,
  ReservationGuest,
  ReservationRequestProduct,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderRequestProduct,
} from '@/types/booking';

/**
 * Reservation lifecycle against the TC API. A reservation holds tickets
 * until expires_at; confirming converts it into a booking (order).
 */
export const reservationsApi = {
  async create(
    products: ReservationRequestProduct[]
  ): Promise<ReservationResource> {
    const body: CreateReservationRequest = { products };
    const res = await apiClient.post<ReservationResponse>(
      '/reservations',
      body
    );
    return res.data;
  },

  async get(reservationNum: string): Promise<ReservationResource> {
    const res = await apiClient.get<ReservationResponse>(
      `/reservations/${encodeURIComponent(reservationNum)}`
    );
    return res.data;
  },

  async cancel(reservationNum: string): Promise<void> {
    await apiClient.delete(
      `/reservations/${encodeURIComponent(reservationNum)}`
    );
  },

  async confirm(
    reservationNum: string,
    guests: ReservationGuest[]
  ): Promise<ConfirmReservationResponse> {
    const body: ConfirmReservationRequest = { guests };
    return apiClient.post<ConfirmReservationResponse>(
      `/reservations/${encodeURIComponent(reservationNum)}/confirm`,
      body
    );
  },
};

/**
 * Direct order creation (POST /orders), bypassing the reservation hold.
 *
 * Fallback for a confirmed sandbox defect: reservations/{number}/confirm
 * reliably returns a 302 (redirects to the API's documentation instead of
 * JSON) whenever the underlying reservation spans more than one ticket
 * category — verified by isolated testing with clean multi-category
 * reservations, different ticket option pairs, and varying guest payloads,
 * all reproducing the same failure, while an identical multi-category
 * booking placed via /orders succeeds immediately. Single-category
 * reservations confirm normally, so that path is left as the primary flow.
 */
export const ordersApi = {
  async create(products: OrderRequestProduct[]): Promise<CreateOrderResponse> {
    const body: CreateOrderRequest = { order: { products } };
    return apiClient.post<CreateOrderResponse>('/orders', body);
  },
};
