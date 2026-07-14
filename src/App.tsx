import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAutoProductSync, useStoredProducts } from './hooks/useProductSync';
import { useAutoInventorySync } from './hooks/useInventory';
import { useStaticData } from './hooks/useStaticData';
import {
  filterUpcomingMatches,
  sortByKickoff,
} from './utils/productFilters';
import { PageLayout } from './components/PageLayout';
import { HomePage } from './pages/HomePage';
import { FixturesPage } from './pages/FixturesPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CreditsPage } from './pages/CreditsPage';

/**
 * Main app component with route-based inventory sync optimization
 */
function AppContent() {
  const location = useLocation();
  const { data: allProducts = [] } = useStoredProducts();

  // Load static data (teams, venues, competitions) on app startup
  useStaticData();

  // Start automatic background syncing for products (hourly)
  useAutoProductSync();

  // Determine which products to sync inventory for based on current route.
  // Listing pages show "from £X" prices, so their visible products need
  // inventory too — batched, max 100 IDs per request (API limit).
  const productsToSync = useMemo(() => {
    // Event detail page: only the event being viewed
    const eventMatch = location.pathname.match(/^\/event\/(\d+)/);
    if (eventMatch) {
      const eventId = parseInt(eventMatch[1], 10);
      return isNaN(eventId) ? [] : [eventId];
    }

    const upcoming = sortByKickoff(filterUpcomingMatches(allProducts));

    // Fixtures page: soonest upcoming matches, capped at one API batch
    if (location.pathname === '/fixtures') {
      return upcoming.slice(0, 100).map((p) => p.id);
    }

    // Homepage: the featured carousel (first 20)
    if (location.pathname === '/') {
      return upcoming.slice(0, 20).map((p) => p.id);
    }

    return [];
  }, [location.pathname, allProducts]);

  // Automatic inventory syncing (every minute for live pricing)
  useAutoInventorySync(productsToSync);

  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/event/:id/:slug" element={<EventDetailPage />} />
        <Route path="/credits" element={<CreditsPage />} />
      </Routes>
    </PageLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
