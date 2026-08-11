import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStoredProducts } from '@/hooks/useProductSync';
import { useStaticData } from '@/hooks/useStaticData';
import {
  filterUpcomingMatches,
  filterByCompetition,
  filterByTeam,
  filterByDateRange,
  sortByKickoff,
} from '@/utils/productFilters';
import { EventCard } from '@/components/EventCard';
import { FilterBar } from '@/components/FilterBar';
import { useFixtureFilters } from '@/hooks/useFixtureFilters';
import type { Team } from '@/types/static-data';

export function FixturesPage() {
  const { data: allProducts = [] } = useStoredProducts();
  const { data: staticData } = useStaticData();
  const { competitionId, teamId, month, query, setFilter, clearAll, hasFilters } =
    useFixtureFilters();
  const [searchParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);

  // The input owns its text locally and syncs to the URL debounced —
  // driving it straight from the URL param drops keystrokes because
  // react-router applies setSearchParams as a non-urgent transition
  const [searchText, setSearchText] = useState(query);
  useEffect(() => {
    setSearchText(query);
  }, [query]);
  useEffect(() => {
    if (searchText === query) return;
    const t = setTimeout(() => setFilter('q', searchText || undefined), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // The header's "Find tickets" button lands here with ?focus=search
  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      searchRef.current?.focus();
    }
  }, [searchParams]);

  const upcomingMatches = useMemo(
    () => sortByKickoff(filterUpcomingMatches(allProducts)),
    [allProducts]
  );

  const filteredMatches = useMemo(() => {
    let filtered = upcomingMatches;
    if (competitionId) filtered = filterByCompetition(filtered, competitionId);
    if (teamId) filtered = filterByTeam(filtered, teamId);
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const from = new Date(year, monthNum - 1, 1);
      const to = new Date(year, monthNum, 0, 23, 59, 59);
      filtered = filterByDateRange(filtered, from, to);
    }
    // Free-text search across team and venue names
    const q = query.toLowerCase().trim();
    if (q && staticData) {
      filtered = filtered.filter((product) => {
        const home = staticData.teams.find((t) => t.id === product.match.home);
        const away = staticData.teams.find((t) => t.id === product.match.away);
        const venue = staticData.venues.find((v) => v.id === product.venue);
        return (
          home?.name.toLowerCase().includes(q) ||
          away?.name.toLowerCase().includes(q) ||
          venue?.name.toLowerCase().includes(q)
        );
      });
    }
    return filtered;
  }, [upcomingMatches, competitionId, teamId, month, query, staticData]);

  // Only offer filters that can actually match something
  const activeCompetitionIds = useMemo(
    () => new Set(upcomingMatches.map((p) => p.match.competition)),
    [upcomingMatches]
  );
  // When a league is selected, the team combobox only offers its teams
  const activeTeamIds = useMemo(() => {
    const source = competitionId
      ? filterByCompetition(upcomingMatches, competitionId)
      : upcomingMatches;
    const ids = new Set<number>();
    source.forEach((p) => {
      ids.add(p.match.home);
      ids.add(p.match.away);
    });
    return ids;
  }, [upcomingMatches, competitionId]);

  // Selecting a league the current team doesn't play in drops the stale
  // team filter instead of silently showing an empty result set
  useEffect(() => {
    if (teamId && activeTeamIds.size > 0 && !activeTeamIds.has(teamId)) {
      setFilter('team', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, activeTeamIds]);

  const competitions = (staticData?.competitions ?? []).filter((c) =>
    activeCompetitionIds.has(c.id)
  );
  const teams: Team[] = (staticData?.teams ?? []).filter((t) =>
    activeTeamIds.has(t.id)
  );

  const isLoading = allProducts.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Fixtures
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        {isLoading
          ? 'Loading fixtures…'
          : `${filteredMatches.length} upcoming match${filteredMatches.length !== 1 ? 'es' : ''}`}
      </p>

      {/* Search */}
      <div className="mt-8 max-w-xl">
        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by team or venue…"
            className="w-full rounded-full border border-gray-200 bg-white px-6 py-3.5 shadow-card placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg
              className="h-5 w-5"
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
      </div>

      <div className="mt-5">
        <FilterBar competitions={competitions} teams={teams} />
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-ocean-500" />
          <p className="text-ink-muted">Loading upcoming matches…</p>
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((product) => (
            <EventCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-gray-300 py-16 text-center">
          <h3 className="font-display text-xl font-bold">No matches found</h3>
          <p className="mt-2 text-ink-muted">
            Nothing fits those filters — try widening your search.
          </p>
          {hasFilters && (
            <button onClick={clearAll} className="btn-secondary mt-6">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
