import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoredProducts } from '@/hooks/useProductSync';
import { useStaticData } from '@/hooks/useStaticData';
import {
  filterUpcomingMatches,
  sortByKickoff,
} from '@/utils/productFilters';
import { getAccent } from '@/utils/accentColors';
import { EventCarousel } from '@/components/EventCarousel';
import { EventCard } from '@/components/EventCard';
import { TrustSection } from '@/components/TrustSection';
import { FAQ } from '@/components/FAQ';
import type { Team } from '@/types/static-data';

export function HomePage() {
  const { data: allProducts = [] } = useStoredProducts();
  const { data: staticData } = useStaticData();
  const [searchQuery, setSearchQuery] = useState('');

  const upcomingMatches = useMemo(
    () => sortByKickoff(filterUpcomingMatches(allProducts)),
    [allProducts]
  );

  // Search across team and venue names
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query || !staticData) return [];
    return upcomingMatches.filter((product) => {
      const homeTeam = staticData.teams.find(
        (t) => t.id === product.match.home
      );
      const awayTeam = staticData.teams.find(
        (t) => t.id === product.match.away
      );
      const venue = staticData.venues.find((v) => v.id === product.venue);
      return (
        homeTeam?.name.toLowerCase().includes(query) ||
        awayTeam?.name.toLowerCase().includes(query) ||
        venue?.name.toLowerCase().includes(query)
      );
    });
  }, [upcomingMatches, searchQuery, staticData]);

  // Top teams by number of upcoming matches, for the browse-by-team strip
  const topTeams = useMemo(() => {
    if (!staticData) return [];
    const counts = new Map<number, number>();
    upcomingMatches.forEach((product) => {
      counts.set(product.match.home, (counts.get(product.match.home) ?? 0) + 1);
      counts.set(product.match.away, (counts.get(product.match.away) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id]) => staticData.teams.find((t) => t.id === id))
      .filter((t): t is Team => Boolean(t));
  }, [upcomingMatches, staticData]);

  const isSearching = searchQuery.trim().length > 0;
  const isLoading = allProducts.length === 0;

  return (
    <div>
      {/* Hero — bold typographic on white */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          Every match.
          <br />
          One ticket <span className="text-tangerine-500">away</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-muted">
          Live pricing on football tickets across every competition — find your
          fixture and take your seat.
        </p>

        {/* Stat pills — pops of color with real numbers */}
        {upcomingMatches.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="chip bg-sky-50 px-4 py-2 text-sm text-sky-700">
              {upcomingMatches.length} matches on sale
            </span>
            <span className="chip bg-tangerine-50 px-4 py-2 text-sm text-tangerine-700">
              {topTeams.length > 0 ? 'Clubs across Europe' : 'Top clubs'}
            </span>
            <span className="chip bg-gold-50 px-4 py-2 text-sm text-gold-700">
              Prices refresh every minute
            </span>
          </div>
        )}

        {/* Search */}
        <div className="mt-10 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by team or venue…"
              className="w-full rounded-full border border-gray-200 bg-white px-6 py-4 text-lg shadow-card placeholder:text-ink-muted focus:border-ink focus:outline-none"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-ink-muted">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          {isSearching && (
            <p className="mt-3 text-sm text-ink-muted">
              Found {searchResults.length} match
              {searchResults.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Search results grid, or featured carousel */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isSearching ? (
          searchResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((product) => (
                <EventCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 py-16 text-center">
              <h3 className="font-display text-xl font-bold">
                No matches found
              </h3>
              <p className="mt-2 text-ink-muted">
                Nothing for “{searchQuery}” — try another team or venue.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn-secondary mt-6"
              >
                Clear search
              </button>
            </div>
          )
        ) : isLoading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-ocean-500" />
            <p className="text-ink-muted">Loading upcoming matches…</p>
          </div>
        ) : (
          <>
            <EventCarousel
              products={upcomingMatches.slice(0, 20)}
              title="Upcoming matches"
            />
            <div className="mt-8 text-center">
              <Link to="/fixtures" className="btn-secondary">
                See all {upcomingMatches.length} fixtures
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Browse by team */}
      {!isSearching && topTeams.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Browse by team
            </h2>
            <Link
              to="/fixtures"
              className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
            >
              All fixtures →
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {topTeams.map((team) => (
              <Link
                key={team.id}
                to={`/fixtures?team=${team.id}`}
                className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 py-3 font-display font-bold transition-colors hover:border-ink hover:bg-ink hover:text-white"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${getAccent(team.id).dot}`}
                />
                {team.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {!isSearching && (
        <>
          <TrustSection />
          <FAQ />
        </>
      )}
    </div>
  );
}
