import { Link } from 'react-router-dom';
import { useStaticData } from '@/hooks/useStaticData';
import { useLowestPrice, useProductInventory } from '@/hooks/useInventory';
import {
  formatEventCardDate,
  formatEventCardTime,
} from '@/utils/dateFormatters';
import { getAccent } from '@/utils/accentColors';
import { getStadiumImage } from '@/utils/stadiumImages';
import type { Product } from '@/types/product';

interface EventCardProps {
  product: Product;
}

export function EventCard({ product }: EventCardProps) {
  const { data: staticData } = useStaticData();
  const { data: lowestPrice, isLoading: priceLoading } = useLowestPrice(
    product.id
  );
  const { data: inventory } = useProductInventory(product.id);

  const homeTeam = staticData?.teams.find((t) => t.id === product.match.home);
  const awayTeam = staticData?.teams.find((t) => t.id === product.match.away);
  const venue = staticData?.venues.find((v) => v.id === product.venue);
  const competition = staticData?.competitions.find(
    (c) => c.id === product.match.competition
  );

  const homeName = homeTeam?.name ?? `Team ${product.match.home}`;
  const awayName = awayTeam?.name ?? `Team ${product.match.away}`;
  // Only claim sold-out when we actually have inventory data for this product;
  // missing data just means its inventory hasn't been synced yet
  const soldOut =
    inventory != null && !inventory.ticket_options.some((o) => o.available);

  const accent = getAccent(product.match.competition);
  const stadium = getStadiumImage(homeTeam?.name);

  return (
    <Link
      to={`/event/${product.id}/${product.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      {/* Home-stadium photo header (freely licensed; credit in title) */}
      {stadium && (
        <div className="relative h-28 flex-shrink-0">
          <img
            src={stadium.card}
            alt=""
            title={`Photo: ${stadium.credit} (${stadium.license}), via Wikimedia Commons`}
            className="h-full w-full object-cover saturate-[.85]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          <span className={`chip ${accent.chip}`}>
            {competition?.name ?? 'Football'}
          </span>
          {soldOut && (
            <span className="chip bg-red-50 text-red-700">Sold out</span>
          )}
        </div>

        {/* Typographic matchup — the team names are the artwork */}
        <h3 className="mt-6 font-display text-2xl font-bold leading-tight tracking-tight">
          {homeName}
          <span className="block text-base font-medium text-ink-muted">v</span>
          {awayName}
        </h3>

        <div className="mt-4 space-y-1 text-sm text-ink-muted">
          <p>
            {formatEventCardDate(product.match.start.local)} ·{' '}
            {formatEventCardTime(product.match.start.local)}
          </p>
          {venue && (
            <p>
              {venue.name}
              {venue.city ? `, ${venue.city}` : ''}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-1 items-end justify-between border-t border-gray-100 pt-4">
          {priceLoading ? (
            <span className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
          ) : lowestPrice != null && !soldOut ? (
            <span className="text-sm text-ink-muted">
              from{' '}
              <span className="font-display text-lg font-bold text-ink">
                £{lowestPrice.toFixed(0)}
              </span>
            </span>
          ) : (
            <span className="text-sm text-ink-muted">
              {soldOut ? 'Check back soon' : 'See tickets'}
            </span>
          )}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-ink transition-colors group-hover:bg-ocean-500 group-hover:text-white">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
