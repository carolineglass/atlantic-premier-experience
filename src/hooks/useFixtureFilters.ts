import { useSearchParams } from 'react-router-dom';

/**
 * Fixture filter state lives in URL search params so filtered views are
 * shareable: ?competition=<id>&team=<id>&month=YYYY-MM&q=<text>
 */
export function useFixtureFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const competitionId = searchParams.get('competition')
    ? Number(searchParams.get('competition'))
    : undefined;
  const teamId = searchParams.get('team')
    ? Number(searchParams.get('team'))
    : undefined;
  const month = searchParams.get('month') ?? undefined;
  const query = searchParams.get('q') ?? '';

  const setFilter = (key: string, value: string | undefined) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true }
    );
  };

  const clearAll = () => setSearchParams({}, { replace: true });

  const hasFilters = Boolean(competitionId || teamId || month || query);

  return {
    competitionId,
    teamId,
    month,
    query,
    setFilter,
    clearAll,
    hasFilters,
  };
}
