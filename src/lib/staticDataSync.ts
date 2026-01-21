import { apiClient } from '@/api/client';
import { StorageService } from './storage.service';
import type {
  StaticData,
  Team,
  TeamResponse,
  Venue,
  VenueResponse,
  CompetitionsResponse,
  CompetitionResponse,
  CountriesResponse,
  TicketCategory,
  DeliveryMethod,
} from '@/types/static-data';

const STATIC_DATA_KEY = 'tc_static_data';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Service for syncing and accessing static reference data (teams, venues, competitions, countries, ticket categories, delivery methods)
 * Recommended sync frequency: Once per day (countries are static and never change)
 */
export class StaticDataSync {
  /**
   * Fetch all items with pagination support
   */
  private static async fetchAllPages<T>(
    endpoint: string,
    dataKey: string
  ): Promise<T[]> {
    const allData: T[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await apiClient.get<{
        data: T[];
        meta: { current_page: number; last_page: number };
      }>(endpoint, {
        params: {
          page: {
            number: currentPage,
            size: 100,
          },
        },
      });

      allData.push(...response.data);
      hasMorePages = response.meta.current_page < response.meta.last_page;
      currentPage++;

      console.log(
        `Fetched ${dataKey} page ${response.meta.current_page}/${response.meta.last_page} (${response.data.length} items)`
      );
    }

    return allData;
  }

  /**
   * Fetch all static data from API and store in localStorage
   */
  static async syncAll(): Promise<StaticData> {
    console.log('Syncing all static data...');

    try {
      // Fetch paginated endpoints
      const [teams, venues, ticketCategories, deliveryMethods] = await Promise.all([
        this.fetchAllPages<Team>('/teams', 'teams'),
        this.fetchAllPages<Venue>('/venues', 'venues'),
        this.fetchAllPages<TicketCategory>('/ticket-categories', 'ticket categories'),
        this.fetchAllPages<DeliveryMethod>('/delivery-methods', 'delivery methods'),
      ]);

      // Fetch non-paginated endpoints
      const [competitions, countries] = await Promise.all([
        apiClient.get<CompetitionsResponse>('/competitions'),
        apiClient.get<CountriesResponse>('/countries'),
      ]);

      const staticData: StaticData = {
        teams,
        venues,
        competitions: competitions.data,
        countries: countries.data,
        ticketCategories,
        deliveryMethods,
        lastSync: Date.now(),
      };

      StorageService.set(STATIC_DATA_KEY, staticData);
      console.log('Static data synced successfully:', {
        teams: teams.length,
        venues: venues.length,
        competitions: competitions.data.length,
        countries: countries.data.length,
        ticketCategories: ticketCategories.length,
        deliveryMethods: deliveryMethods.length,
      });

      return staticData;
    } catch (error) {
      console.error('Failed to sync static data:', error);
      // Return cached data if available
      const cached = this.getStored();
      if (cached) {
        console.log('Using cached static data due to sync failure');
        return cached;
      }
      throw error;
    }
  }

  /**
   * Get static data from localStorage
   */
  static getStored(): StaticData | null {
    return StorageService.get<StaticData>(STATIC_DATA_KEY);
  }

  /**
   * Check if static data needs refresh (older than 1 day)
   */
  static needsRefresh(): boolean {
    const stored = this.getStored();
    if (!stored || !stored.lastSync) return true;

    const age = Date.now() - stored.lastSync;
    return age > ONE_DAY_MS;
  }

  /**
   * Get static data, syncing if necessary
   */
  static async get(): Promise<StaticData> {
    const stored = this.getStored();

    // Return cached if fresh
    if (stored && !this.needsRefresh()) {
      return stored;
    }

    // Sync if stale or missing
    return this.syncAll();
  }

  /**
   * Fetch a specific team by ID
   */
  static async getTeam(id: number): Promise<TeamResponse['data']> {
    const staticData = this.getStored();

    // Check cache first
    if (staticData) {
      const team = staticData.teams.find((t) => t.id === id);
      if (team) return team;
    }

    // Fetch from API if not in cache
    const response = await apiClient.get<TeamResponse>(`/teams/${id}`);
    return response.data;
  }

  /**
   * Fetch a specific venue by ID
   */
  static async getVenue(id: number): Promise<VenueResponse['data']> {
    const staticData = this.getStored();

    // Check cache first
    if (staticData) {
      const venue = staticData.venues.find((v) => v.id === id);
      if (venue) return venue;
    }

    // Fetch from API if not in cache
    const response = await apiClient.get<VenueResponse>(`/venues/${id}`);
    return response.data;
  }

  /**
   * Fetch a specific competition by ID
   */
  static async getCompetition(
    id: number
  ): Promise<CompetitionResponse['data']> {
    const staticData = this.getStored();

    // Check cache first
    if (staticData) {
      const competition = staticData.competitions.find((c) => c.id === id);
      if (competition) return competition;
    }

    // Fetch from API if not in cache
    const response = await apiClient.get<CompetitionResponse>(
      `/competitions/${id}`
    );
    return response.data;
  }

  /**
   * Get team name by ID (convenience method)
   */
  static getTeamName(id: number): string | null {
    const staticData = this.getStored();
    if (!staticData) return null;

    const team = staticData.teams.find((t) => t.id === id);
    return team?.name || null;
  }

  /**
   * Get venue name by ID (convenience method)
   */
  static getVenueName(id: number): string | null {
    const staticData = this.getStored();
    if (!staticData) return null;

    const venue = staticData.venues.find((v) => v.id === id);
    return venue?.name || null;
  }

  /**
   * Get competition name by ID (convenience method)
   */
  static getCompetitionName(id: number): string | null {
    const staticData = this.getStored();
    if (!staticData) return null;

    const competition = staticData.competitions.find((c) => c.id === id);
    return competition?.name || null;
  }

  /**
   * Get country name by ID (convenience method)
   */
  static getCountryName(id: number): string | null {
    const staticData = this.getStored();
    if (!staticData) return null;

    const country = staticData.countries.find((c) => c.id === id);
    return country?.name || null;
  }

  /**
   * Get country by code (convenience method)
   */
  static getCountryByCode(code: string): string | null {
    const staticData = this.getStored();
    if (!staticData) return null;

    const country = staticData.countries.find((c) => c.code === code);
    return country?.name || null;
  }

  /**
   * Get ticket category name by ID (convenience method)
   */
  static getTicketCategoryName(id: number): string | null {
    const staticData = this.getStored();
    if (!staticData) return null;

    const category = staticData.ticketCategories.find((c) => c.id === id);
    return category?.name || null;
  }

  /**
   * Get ticket categories by venue ID (convenience method)
   */
  static getTicketCategoriesByVenue(venueId: number) {
    const staticData = this.getStored();
    if (!staticData) return [];

    return staticData.ticketCategories.filter((c) => c.venue === venueId);
  }

  /**
   * Clear all static data from localStorage
   */
  static clear(): void {
    StorageService.remove(STATIC_DATA_KEY);
    console.log('Cleared static data from localStorage');
  }
}
