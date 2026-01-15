import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAutoProductSync, useStoredProducts } from './hooks/useProductSync';
import { useAutoInventorySync } from './hooks/useInventory';
import { useStaticData } from './hooks/useStaticData';
import { filterUpcomingMatches } from './utils/productFilters';
import { VisibleProductsProvider, useVisibleProducts } from './contexts/VisibleProductsContext';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';

/**
 * Main app component with route-based inventory sync optimization
 */
function AppContent() {
  const location = useLocation();
  const { visibleProductIds } = useVisibleProducts();

  // Load static data (teams, venues, competitions) on app startup
  useStaticData();

  // Start automatic background syncing for products (hourly)
  useAutoProductSync();

  // Get all products and filter for upcoming matches
  const { data: allProducts = [] } = useStoredProducts();
  const upcomingMatches = filterUpcomingMatches(allProducts);

  // Determine which products to sync based on current route
  // This optimizes API usage by only syncing inventory for relevant products
  // Uses visibleProductIds from context to sync products actually being displayed
  // (e.g., after search filtering on homepage)
  const productsToSync = useMemo(() => {
    // Event detail page: only sync the specific event being viewed
    // Extract ID from URL (format: "/event/123/slug" where 123 is the ID)
    const eventMatch = location.pathname.match(/^\/event\/(\d+)/);
    if (eventMatch) {
      const eventId = parseInt(eventMatch[1], 10);
      if (!isNaN(eventId)) {
        return [eventId];
      }
    }

    // Homepage: sync products currently visible in carousel
    // Falls back to first 20 if no specific products are set (initial load)
    if (location.pathname === '/') {
      if (visibleProductIds.length > 0) {
        // Sync products set by HomePage (e.g., search results or filtered view)
        return visibleProductIds;
      }
      // Default: sync first 20 events for initial load
      return upcomingMatches.slice(0, 20).map((p) => p.id);
    }

    // Default: no sync for other routes
    return [];
  }, [location.pathname, upcomingMatches, visibleProductIds]);

  // Start automatic inventory syncing (every minute for live pricing)
  // Syncs only products relevant to current page
  useAutoInventorySync(productsToSync);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/event/:id/:slug" element={<EventDetailPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <VisibleProductsProvider>
        <AppContent />
      </VisibleProductsProvider>
    </BrowserRouter>
  );
}

export default App;
