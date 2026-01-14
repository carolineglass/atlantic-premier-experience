import { useQuery } from '@tanstack/react-query';
import { StaticDataSync } from '@/lib/staticDataSync';
import type { StaticData, Team, Venue, Competition } from '@/types/static-data';

/**
 * Hook to get all static data
 */
export function useStaticData() {
  return useQuery<StaticData>({
    queryKey: ['staticData'],
    queryFn: () => StaticDataSync.get(),
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    gcTime: 24 * 60 * 60 * 1000, // 1 day
  });
}

/**
 * Hook to get a specific team by ID
 */
export function useTeam(teamId: number | undefined) {
  return useQuery<Team | null>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      return StaticDataSync.getTeam(teamId);
    },
    enabled: teamId !== undefined,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
}

/**
 * Hook to get a specific venue by ID
 */
export function useVenue(venueId: number | undefined) {
  return useQuery<Venue | null>({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      if (!venueId) return null;
      return StaticDataSync.getVenue(venueId);
    },
    enabled: venueId !== undefined,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
}

/**
 * Hook to get a specific competition by ID
 */
export function useCompetition(competitionId: number | undefined) {
  return useQuery<Competition | null>({
    queryKey: ['competition', competitionId],
    queryFn: async () => {
      if (!competitionId) return null;
      return StaticDataSync.getCompetition(competitionId);
    },
    enabled: competitionId !== undefined,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
}

/**
 * Hook to get team name from cache (synchronous)
 * Returns null if static data not loaded yet
 */
export function useTeamName(teamId: number | undefined): string | null {
  const { data: staticData } = useStaticData();

  if (!teamId || !staticData) return null;

  const team = staticData.teams.find((t) => t.id === teamId);
  return team?.name || null;
}

/**
 * Hook to get venue name from cache (synchronous)
 * Returns null if static data not loaded yet
 */
export function useVenueName(venueId: number | undefined): string | null {
  const { data: staticData } = useStaticData();

  if (!venueId || !staticData) return null;

  const venue = staticData.venues.find((v) => v.id === venueId);
  return venue?.name || null;
}

/**
 * Hook to get competition name from cache (synchronous)
 * Returns null if static data not loaded yet
 */
export function useCompetitionName(
  competitionId: number | undefined
): string | null {
  const { data: staticData } = useStaticData();

  if (!competitionId || !staticData) return null;

  const competition = staticData.competitions.find((c) => c.id === competitionId);
  return competition?.name || null;
}
