import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAutoProductSync } from './hooks/useProductSync';
import { useAutoInventorySync } from './hooks/useInventory';
import { useStaticData } from './hooks/useStaticData';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';

/**
 * Main app component with route-based inventory sync optimization
 */
function AppContent() {
  const location = useLocation();

  // Load static data (teams, venues, competitions) on app startup
  useStaticData();

  // Start automatic background syncing for products (hourly)
  useAutoProductSync();

  // Determine which products to sync inventory for based on current route
  // Homepage: no inventory sync (only shows team names and dates)
  // Event detail page: sync only the specific event being viewed
  const productsToSync = useMemo(() => {
    // Event detail page: only sync the specific event being viewed
    // Extract ID from URL (format: "/event/123/slug" where 123 is the ID)
    const eventMatch = location.pathname.match(/^\/event\/(\d+)/);
    if (eventMatch) {
      const eventId = parseInt(eventMatch[1], 10);
      if (!isNaN(eventId)) {
        console.log(`App: Event detail page - syncing inventory for product ${eventId}`);
        return [eventId];
      }
    }

    // Homepage: no inventory sync needed
    console.log('App: Homepage - no inventory sync (inventory fetched on event detail page)');
    return [];
  }, [location.pathname]);

  // Start automatic inventory syncing (every minute for live pricing)
  // Only syncs for event detail pages
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
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
