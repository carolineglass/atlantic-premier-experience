import { useMemo } from 'react';
import { useStoredProducts } from '@/hooks/useProductSync';
import { filterUpcomingMatches } from '@/utils/productFilters';
import { EventCarousel } from '@/components/EventCarousel';
import type { Product } from '@/types/product';

export function HomePage() {
  const { data: allProducts = [] } = useStoredProducts();

  // Filter and sort upcoming matches
  const upcomingMatches = useMemo(() => {
    return filterUpcomingMatches(allProducts).sort((a, b) => {
      // Sort by date (soonest first)
      return (
        new Date(a.match.start.local).getTime() -
        new Date(b.match.start.local).getTime()
      );
    });
  }, [allProducts]);

  const handleEventClick = (product: Product) => {
    // TODO: Navigate to event detail page when routing is set up
    console.log('Event clicked:', product.id, product.name);
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
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Upcoming Matches Carousel */}
        {upcomingMatches.length > 0 ? (
          <EventCarousel
            products={upcomingMatches}
            title="Upcoming Matches"
            onEventClick={handleEventClick}
          />
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading upcoming matches...</p>
          </div>
        )}
        {/* todo: ui when there are no upcoming matches found */}
      </main>
    </div>
  );
}
