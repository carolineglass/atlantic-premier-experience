import { useMemo } from 'react';
import { useStoredProducts } from '@/hooks/useProductSync';
import { useStaticData } from '@/hooks/useStaticData';
import { filterUpcomingMatches } from '@/utils/productFilters';
import type { Competition, Team } from '@/types/static-data';

export interface CompetitionWithTeams {
  competition: Competition;
  teams: Team[];
  matchCount: number;
}

/**
 * Competitions that currently have upcoming matches, each with the teams
 * playing in them — powers the header's league/teams menu. Sorted by match
 * count so the biggest leagues come first.
 */
export function useCompetitionsWithTeams(): CompetitionWithTeams[] {
  const { data: products = [] } = useStoredProducts();
  const { data: staticData } = useStaticData();

  return useMemo(() => {
    if (!staticData) return [];

    const byComp = new Map<number, { teamIds: Set<number>; count: number }>();
    filterUpcomingMatches(products).forEach((p) => {
      let entry = byComp.get(p.match.competition);
      if (!entry) {
        entry = { teamIds: new Set(), count: 0 };
        byComp.set(p.match.competition, entry);
      }
      entry.teamIds.add(p.match.home);
      entry.teamIds.add(p.match.away);
      entry.count++;
    });

    return [...byComp.entries()]
      .flatMap(([id, entry]) => {
        const competition = staticData.competitions.find((c) => c.id === id);
        if (!competition) return [];
        return [
          {
            competition,
            teams: staticData.teams
              .filter((t) => entry.teamIds.has(t.id))
              .sort((a, b) => a.name.localeCompare(b.name)),
            matchCount: entry.count,
          },
        ];
      })
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [products, staticData]);
}
