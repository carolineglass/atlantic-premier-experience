import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAutoProductSync, useStoredProducts } from './hooks/useProductSync';
import { useAutoInventorySync } from './hooks/useInventory';
import { useStaticData } from './hooks/useStaticData';
import { filterUpcomingMatches } from './utils/productFilters';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';

function App() {
  // Load static data (teams, venues, competitions) on app startup
  useStaticData();

  // Start automatic background syncing for products (hourly)
  useAutoProductSync();

  // Get all products and filter for upcoming matches
  const { data: allProducts = [] } = useStoredProducts();
  const upcomingMatches = filterUpcomingMatches(allProducts);
  const upcomingProductIds = upcomingMatches.map((p) => p.id);

  // Start automatic inventory syncing (every minute for live pricing)
  // Only sync upcoming matches to optimize API usage
  useAutoInventorySync(upcomingProductIds);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
