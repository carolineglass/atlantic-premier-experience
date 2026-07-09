import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAutoProductSync, useStoredProducts } from './hooks/useProductSync';
import { useAutoInventorySync } from './hooks/useInventory';
import { useStaticData } from './hooks/useStaticData';
import {
  filterUpcomingMatches,
  filterByTeam,
  sortByKickoff,
} from './utils/productFilters';
import { slugify } from './utils/slugify';
import { PageLayout } from './components/PageLayout';
import { HomePage } from './pages/HomePage';
import { FixturesPage } from './pages/FixturesPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamPage } from './pages/TeamPage';
import { EventDetailPage } from './pages/EventDetailPage';

/**
 * Main app component with route-based inventory sync optimization
 */
function AppContent() {
  const location = useLocation();
  const { data: allProducts = [] } = useStoredProducts();
  const { data: staticData } = useStaticData();

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

    // Team page: that team's upcoming matches
    const teamMatch = location.pathname.match(/^\/team\/([^/]+)/);
    if (teamMatch) {
      const team = staticData?.teams.find(
        (t) => slugify(t.name) === teamMatch[1]
      );
      if (!team) return [];
      return filterByTeam(upcoming, team.id)
        .slice(0, 100)
        .map((p) => p.id);
    }

    // Fixtures page: soonest upcoming matches, capped at one API batch
    if (location.pathname === '/fixtures') {
      return upcoming.slice(0, 100).map((p) => p.id);
    }

    // Homepage: the featured carousel (first 20)
    if (location.pathname === '/') {
      return upcoming.slice(0, 20).map((p) => p.id);
    }

    return [];
  }, [location.pathname, allProducts, staticData]);

  // Automatic inventory syncing (every minute for live pricing)
  useAutoInventorySync(productsToSync);

  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/team/:slug" element={<TeamPage />} />
        <Route path="/event/:id/:slug" element={<EventDetailPage />} />
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
