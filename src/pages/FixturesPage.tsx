import { useMemo } from 'react';
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
  const { competitionId, teamId, month, clearAll, hasFilters } =
    useFixtureFilters();

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
    return filtered;
  }, [upcomingMatches, competitionId, teamId, month]);

  // Only offer filters that can actually match something
  const activeCompetitionIds = useMemo(
    () => new Set(upcomingMatches.map((p) => p.match.competition)),
    [upcomingMatches]
  );
  const activeTeamIds = useMemo(() => {
    const ids = new Set<number>();
    upcomingMatches.forEach((p) => {
      ids.add(p.match.home);
      ids.add(p.match.away);
    });
    return ids;
  }, [upcomingMatches]);

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

      <div className="mt-8">
        <FilterBar competitions={competitions} teams={teams} />
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-pitch-500" />
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
