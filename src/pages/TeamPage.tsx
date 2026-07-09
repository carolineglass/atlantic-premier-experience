import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStoredProducts } from '@/hooks/useProductSync';
import { useStaticData } from '@/hooks/useStaticData';
import {
  filterUpcomingMatches,
  filterByTeam,
  sortByKickoff,
} from '@/utils/productFilters';
import { slugify } from '@/utils/slugify';
import { EventCard } from '@/components/EventCard';
import { TeamBadge } from '@/components/TeamBadge';

export function TeamPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: allProducts = [] } = useStoredProducts();
  const { data: staticData } = useStaticData();

  // Slugs are generated client-side from team names (API has no team slugs)
  const team = useMemo(
    () => staticData?.teams.find((t) => slugify(t.name) === slug),
    [staticData, slug]
  );

  const teamMatches = useMemo(() => {
    if (!team) return [];
    return sortByKickoff(
      filterByTeam(filterUpcomingMatches(allProducts), team.id)
    );
  }, [allProducts, team]);

  const isLoading = !staticData || allProducts.length === 0;

  if (!isLoading && !team) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Team not found</h1>
        <p className="mt-3 text-ink-muted">
          We couldn’t find that team — it may no longer have tickets on sale.
        </p>
        <Link to="/teams" className="btn-secondary mt-8">
          Browse all teams
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {team ? (
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <TeamBadge name={team.name} size="xl" />
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {team.name}
            </h1>
            <p className="mt-2 text-lg text-ink-muted">
              {teamMatches.length} upcoming match
              {teamMatches.length !== 1 ? 'es' : ''} with tickets on sale
            </p>
          </div>
        </div>
      ) : (
        <div className="h-24 w-2/3 animate-pulse rounded-2xl bg-gray-100" />
      )}

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-pitch-500" />
          <p className="text-ink-muted">Loading fixtures…</p>
        </div>
      ) : teamMatches.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMatches.map((product) => (
            <EventCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-gray-300 py-16 text-center">
          <h3 className="font-display text-xl font-bold">
            No upcoming fixtures
          </h3>
          <p className="mt-2 text-ink-muted">
            No tickets on sale for this team right now.
          </p>
          <Link to="/fixtures" className="btn-secondary mt-6">
            Browse all fixtures
          </Link>
        </div>
      )}
    </div>
  );
}
