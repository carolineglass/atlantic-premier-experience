import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  reservationSyncStarted,
  reservationSecured,
  reservationExpired,
  reservationFailed,
} from '@/store/slices/cartSlice';
import { reservationsApi } from '@/api/reservations';

const SYNC_DEBOUNCE_MS = 800;

/**
 * Fired by the drawer's "re-secure" button; the sync hook (mounted in App)
 * listens and re-reserves the current cart.
 */
export const RESECURE_EVENT = 'tc:resecure-reservation';

export function requestResecure() {
  window.dispatchEvent(new Event(RESECURE_EVENT));
}

/**
 * Keeps a TC reservation in lockstep with the cart: any change to the cart
 * items cancels the previous reservation and creates a fresh one holding
 * the full cart (the API has no add-product-to-reservation endpoint, so
 * cancel-and-recreate covers add/update/remove with one code path).
 *
 * Also watches the hold expiry and flips the reservation to 'expired' when
 * the countdown ends, so the drawer can offer to re-secure.
 *
 * Mount exactly once (in App).
 */
export function useReservationSync() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const reservation = useAppSelector((state) => state.cart.reservation);

  // Signature captures everything that requires a new hold
  const signature = items
    .map((i) => `${i.ticketOptionId}x${i.quantity}`)
    .join(',');

  const lastSyncedRef = useRef<string | null>(null);
  const activeNumberRef = useRef<string | null>(null);
  activeNumberRef.current = reservation?.number ?? null;

  // Bumped by the re-secure button to force a fresh reservation
  const [resecureTick, setResecureTick] = useState(0);
  useEffect(() => {
    const onResecure = () => {
      lastSyncedRef.current = null;
      setResecureTick((t) => t + 1);
    };
    window.addEventListener(RESECURE_EVENT, onResecure);
    return () => window.removeEventListener(RESECURE_EVENT, onResecure);
  }, []);

  useEffect(() => {
    // First run after rehydrate: if the persisted hold still matches the
    // cart and hasn't expired, keep it instead of re-reserving
    if (
      lastSyncedRef.current === null &&
      resecureTick === 0 &&
      reservation?.status === 'holding' &&
      reservation.number &&
      reservation.expiresAt &&
      reservation.expiresAt * 1000 > Date.now()
    ) {
      lastSyncedRef.current = signature;
      return;
    }

    if (signature === lastSyncedRef.current) return;

    const syncItems = items.map((i) => ({
      ticket_option: i.ticketOptionId,
      quantity: i.quantity,
    }));

    const timer = setTimeout(async () => {
      const previous = activeNumberRef.current;
      lastSyncedRef.current = signature;

      if (syncItems.length === 0) {
        // Cart emptied: release the hold
        if (previous) {
          reservationsApi.cancel(previous).catch(() => undefined);
        }
        return;
      }

      dispatch(reservationSyncStarted());
      try {
        if (previous) {
          await reservationsApi.cancel(previous).catch(() => undefined);
        }
        const res = await reservationsApi.create(syncItems);
        dispatch(
          reservationSecured({
            number: res.reservation_num,
            expiresAt: res.expires_at,
            priceTotal: res.price_total,
          })
        );
      } catch (error) {
        lastSyncedRef.current = null; // allow retry
        dispatch(
          reservationFailed(
            'Could not hold these tickets — availability may have changed.'
          )
        );
        console.error('Reservation sync failed:', error);
      }
    }, SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, resecureTick, dispatch]);

  // Expiry watcher
  useEffect(() => {
    if (reservation?.status !== 'holding' || !reservation.expiresAt) return;
    const msLeft = reservation.expiresAt * 1000 - Date.now();
    if (msLeft <= 0) {
      dispatch(reservationExpired());
      return;
    }
    const timer = setTimeout(() => dispatch(reservationExpired()), msLeft);
    return () => clearTimeout(timer);
  }, [reservation?.status, reservation?.expiresAt, dispatch]);
}
