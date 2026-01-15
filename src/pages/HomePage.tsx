import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoredProducts } from '@/hooks/useProductSync';
import { filterUpcomingMatches } from '@/utils/productFilters';
import { EventCarousel } from '@/components/EventCarousel';
import { useVisibleProducts } from '@/contexts/VisibleProductsContext';
import { useStaticData } from '@/hooks/useStaticData';
import type { Product } from '@/types/product';

export function HomePage() {
  const navigate = useNavigate();
  const { data: allProducts = [] } = useStoredProducts();
  const { data: staticData } = useStaticData();
  const { setVisibleProductIds } = useVisibleProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort upcoming matches with search
  const upcomingMatches = useMemo(() => {
    let filtered = filterUpcomingMatches(allProducts);

    // Apply search filter
    if (searchQuery.trim() && staticData) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        // Get team names
        const homeTeam = staticData.teams.find((t) => t.id === product.match.home);
        const awayTeam = staticData.teams.find((t) => t.id === product.match.away);
        const venue = staticData.venues.find((v) => v.id === product.venue);

        // Search in team names
        const homeTeamMatch = homeTeam?.name.toLowerCase().includes(query);
        const awayTeamMatch = awayTeam?.name.toLowerCase().includes(query);

        // Search in venue name
        const venueMatch = venue?.name.toLowerCase().includes(query);

        return homeTeamMatch || awayTeamMatch || venueMatch;
      });
    }

    // Sort by date (soonest first)
    return filtered.sort((a, b) => {
      return (
        new Date(a.match.start.local).getTime() -
        new Date(b.match.start.local).getTime()
      );
    });
  }, [allProducts, searchQuery, staticData]);

  // Update visible products for inventory sync optimization
  // Takes first 20 products being displayed (covers initial view + some scrolling)
  // When search is implemented, this will automatically sync search results
  useEffect(() => {
    const visibleIds = upcomingMatches.slice(0, 20).map((p) => p.id);
    setVisibleProductIds(visibleIds);
  }, [upcomingMatches, setVisibleProductIds]);

  const handleEventClick = (product: Product) => {
    // ID-first URL structure for unique, SEO-friendly URLs (e.g., "/event/123/manchester-united-v-liverpool")
    navigate(`/event/${product.id}/${product.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-screen w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/images/hero/hero_image.png')" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-3xl sm:text-5xl md:text-6xl mb-4">
              Your Dream Game
              <span className="block">Awaits You</span>
            </h1>

            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by team or venue..."
                  className="w-full px-6 py-4 text-lg rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-6 h-6"
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
              {searchQuery && (
                <div className="mt-2 text-sm text-white/80">
                  Found {upcomingMatches.length} match{upcomingMatches.length !== 1 ? 'es' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Upcoming Matches Carousel */}
        {upcomingMatches.length > 0 ? (
          <EventCarousel
            products={upcomingMatches}
            title={searchQuery ? 'Search Results' : 'Upcoming Matches'}
            onEventClick={handleEventClick}
          />
        ) : searchQuery ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              No matches found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading upcoming matches...</p>
          </div>
        )}
      </main>
    </div>
  );
}
