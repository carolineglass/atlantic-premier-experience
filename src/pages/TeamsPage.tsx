import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoredProducts } from '@/hooks/useProductSync';
import { useStaticData } from '@/hooks/useStaticData';
import { filterUpcomingMatches } from '@/utils/productFilters';
import { slugify } from '@/utils/slugify';
import type { Team } from '@/types/static-data';

export function TeamsPage() {
  const { data: allProducts = [] } = useStoredProducts();
  const { data: staticData } = useStaticData();
  const [query, setQuery] = useState('');

  // Teams with at least one upcoming match, with their match counts
  const teamsWithMatches = useMemo(() => {
    if (!staticData) return [];
    const counts = new Map<number, number>();
    filterUpcomingMatches(allProducts).forEach((product) => {
      counts.set(product.match.home, (counts.get(product.match.home) ?? 0) + 1);
      counts.set(product.match.away, (counts.get(product.match.away) ?? 0) + 1);
    });
    return staticData.teams
      .filter((t) => counts.has(t.id))
      .map((t) => ({ team: t, matchCount: counts.get(t.id)! }))
      .sort((a, b) => a.team.name.localeCompare(b.team.name));
  }, [allProducts, staticData]);

  const visibleTeams = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return teamsWithMatches;
    return teamsWithMatches.filter(({ team }) =>
      team.name.toLowerCase().includes(q)
    );
  }, [teamsWithMatches, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Teams
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        Every club with tickets on sale right now.
      </p>

      <div className="mt-8 max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams…"
          className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 shadow-card placeholder:text-ink-muted focus:border-ink focus:outline-none"
        />
      </div>

      {visibleTeams.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleTeams.map(({ team, matchCount }: { team: Team; matchCount: number }) => (
            <Link
              key={team.id}
              to={`/team/${slugify(team.name)}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <p className="font-display text-lg font-bold leading-tight tracking-tight">
                {team.name}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                {matchCount} upcoming match{matchCount !== 1 ? 'es' : ''}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-gray-300 py-16 text-center">
          <h3 className="font-display text-xl font-bold">No teams found</h3>
          <p className="mt-2 text-ink-muted">
            {teamsWithMatches.length === 0
              ? 'Team data is still loading — check back in a moment.'
              : `Nothing for “${query}”.`}
          </p>
        </div>
      )}
    </div>
  );
}
