import { useParams, Link } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useStaticData } from '@/hooks/useStaticData';
import { useProductInventory } from '@/hooks/useInventory';
import {
  formatEventDetailDate,
  formatEventDetailTime,
} from '@/utils/dateFormatters';
import { SeatingChart } from '@/components/SeatingChart';
import { InteractiveSeatMap } from '@/components/InteractiveSeatMap';

// TODO(production): remove this prototype gate before deploying to production.
// The sandbox API returns empty seating_plan for every product, so Celtic Park
// events demo the interactive map with a vendored SVG + mock zone mapping.
// With a production key, product.seating_plan provides the real image URL and
// category_map — delete PROTOTYPE_VENUE_SVGS and pass those through instead.
const PROTOTYPE_VENUE_SVGS: Record<string, string> = {
  'Celtic Park': '/seating-prototype/celtic-park.svg',
};

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Extract product ID from URL parameter (format: "/event/123/slug")
  const productId = id ? parseInt(id, 10) : undefined;

  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(productId);
  const { data: inventory, isLoading: inventoryLoading } =
    useProductInventory(productId);
  const { data: staticData, isLoading: staticDataLoading } = useStaticData();

  const [selectedTickets, setSelectedTickets] = useState<
    Record<number, number>
  >({});

  // Clicking a seat-map zone jumps to (and briefly highlights) its ticket card
  const scrollToCategory = useCallback((categoryId: number) => {
    const el = document.querySelector(`[data-ticket-category="${categoryId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-pitch-500');
    setTimeout(() => el.classList.remove('ring-2', 'ring-pitch-500'), 1600);
  }, []);

  // Wait for all data to load
  if (productLoading || inventoryLoading || staticDataLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-pitch-500" />
          <p className="text-ink-muted">Loading event details…</p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Event not found</h1>
          <p className="mt-3 text-ink-muted">
            This fixture may have expired or moved.
          </p>
          <Link to="/fixtures" className="btn-secondary mt-8">
            Browse all fixtures
          </Link>
        </div>
      </div>
    );
  }

  // Get team/venue/competition names from static data
  const homeTeamName =
    staticData?.teams.find((t) => t.id === product.match.home)?.name ??
    `Team ${product.match.home}`;
  const awayTeamName =
    staticData?.teams.find((t) => t.id === product.match.away)?.name ??
    `Team ${product.match.away}`;
  const venue = staticData?.venues.find((v) => v.id === product.venue);
  const competitionName = staticData?.competitions.find(
    (c) => c.id === product.match.competition
  )?.name;

  const formattedDate = formatEventDetailDate(product.match.start.local);
  const formattedTime = formatEventDetailTime(product.match.start.local);

  const availableTickets =
    inventory?.ticket_options.filter((t) => t.available) || [];
  const isSoldOut = availableTickets.length === 0;

  const handleQuantityChange = (ticketId: number, quantity: number) => {
    setSelectedTickets((prev) => {
      if (quantity === 0) {
        const rest = { ...prev };
        delete rest[ticketId];
        return rest;
      }
      return { ...prev, [ticketId]: quantity };
    });
  };

  const totalItems = Object.values(selectedTickets).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const totalPrice = Object.entries(selectedTickets).reduce(
    (sum, [ticketId, qty]) => {
      const ticket = availableTickets.find(
        (t) => t.id === parseInt(ticketId, 10)
      );
      return sum + (ticket ? ticket.price * qty : 0);
    },
    0
  );

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', selectedTickets);
    alert(
      `Added ${totalItems} ticket(s) to cart. Total: £${totalPrice.toFixed(2)}`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        to="/fixtures"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"
      >
        <span aria-hidden="true">←</span> All fixtures
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Match Header */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-gray-100 text-ink-soft">
                {competitionName || `Competition ${product.match.competition}`}
              </span>
              <span
                className={`chip ${
                  product.match.status === 'Upcoming'
                    ? 'bg-pitch-50 text-pitch-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {product.match.status}
              </span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              {homeTeamName}
              <span className="block text-xl font-medium text-ink-muted md:text-2xl">
                v
              </span>
              {awayTeamName}
            </h1>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-ink-soft">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-ink-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {formattedDate} · {formattedTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-ink-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  {venue
                    ? `${venue.name}${venue.city ? `, ${venue.city}` : ''}`
                    : `Venue ${product.venue}`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive seat map: real seating_plan data when the API
              provides it, else the prototype SVG for demo venues */}
          {(() => {
            const realPlan = product.seating_plan?.[0];
            const prototypeSvg = Object.entries(PROTOTYPE_VENUE_SVGS).find(
              ([name]) => venue?.name.includes(name)
            )?.[1];
            const svgUrl = realPlan?.image ?? prototypeSvg;
            const allTickets = inventory?.ticket_options ?? [];
            if (svgUrl && allTickets.length > 0) {
              return (
                <InteractiveSeatMap
                  svgUrl={svgUrl}
                  categoryMap={realPlan?.category_map}
                  tickets={allTickets}
                  categories={staticData?.ticketCategories ?? []}
                  onSectionSelect={scrollToCategory}
                  isPrototypeData={!realPlan}
                />
              );
            }
            // Static chart fallback (major venues only; hides itself on 403)
            return venue?.images?.seating ? (
              <SeatingChart
                imageUrl={venue.images.seating}
                venueName={venue.name}
              />
            ) : null;
          })()}

          {/* Product Information */}
          {product.information && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold">
                Event information
              </h2>
              <div
                className="prose mt-4 max-w-none text-ink-soft"
                dangerouslySetInnerHTML={{ __html: product.information }}
              />
            </div>
          )}

          {/* Notes */}
          {product.notes && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold">
                Important notes
              </h2>
              <div
                className="prose mt-4 max-w-none text-ink-soft"
                dangerouslySetInnerHTML={{ __html: product.notes }}
              />
            </div>
          )}

          {/* Timetable */}
          {product.timetable && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold">
                Event timetable
              </h2>
              <div
                className="prose mt-4 max-w-none text-ink-soft"
                dangerouslySetInnerHTML={{ __html: product.timetable }}
              />
            </div>
          )}
        </div>

        {/* Sidebar - Ticket Selection */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-6 shadow-card">
            <h2 className="font-display text-2xl font-bold">Select tickets</h2>

            {isSoldOut ? (
              <div className="py-10 text-center">
                <div className="chip mx-auto bg-red-50 text-red-700">
                  Sold out
                </div>
                <p className="mt-4 text-ink-muted">
                  No tickets currently available — prices refresh every minute,
                  so check back soon.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {availableTickets.map((ticket) => {
                  const selected = (selectedTickets[ticket.id] || 0) > 0;
                  const category = staticData?.ticketCategories.find(
                    (c) => c.id === ticket.ticket_category
                  );
                  return (
                    <div
                      key={ticket.id}
                      data-ticket-category={ticket.ticket_category}
                      className={`rounded-2xl border p-4 transition-colors ${
                        selected
                          ? 'border-pitch-500 bg-pitch-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold leading-snug">
                            {category?.color && (
                              <span
                                className="h-3 w-3 flex-shrink-0 rounded-full border border-ink/10"
                                style={{ backgroundColor: category.color }}
                                title={`Zone color on the seating plan`}
                              />
                            )}
                            {ticket.name}
                          </h3>
                          <p className="mt-1 font-display text-2xl font-bold">
                            £{ticket.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="chip bg-pitch-50 text-pitch-700">
                          Available
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <label
                          htmlFor={`qty-${ticket.id}`}
                          className="text-sm text-ink-muted"
                        >
                          Quantity
                        </label>
                        <select
                          id={`qty-${ticket.id}`}
                          value={selectedTickets[ticket.id] || 0}
                          onChange={(e) =>
                            handleQuantityChange(
                              ticket.id,
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold focus:border-ink focus:outline-none"
                        >
                          {Array.from(
                            { length: Math.min(ticket.max_purchase_qty, 10) + 1 },
                            (_, i) => i
                          ).map((qty) => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>

                      {ticket.max_purchase_qty && (
                        <p className="mt-2 text-xs text-ink-muted">
                          Max {ticket.max_purchase_qty} per order
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cart Summary */}
            {totalItems > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>Tickets</span>
                  <span>{totalItems}</span>
                </div>
                <div className="mt-2 flex justify-between font-display text-xl font-bold">
                  <span>Total</span>
                  <span>£{totalPrice.toFixed(2)}</span>
                </div>
                <button onClick={handleAddToCart} className="btn-primary mt-5 w-full">
                  Add to cart
                </button>
              </div>
            )}

            {!isSoldOut && totalItems === 0 && (
              <p className="mt-6 text-center text-sm text-ink-muted">
                Select ticket quantities above
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
