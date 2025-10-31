import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAutoProductSync } from './hooks/useProductSync';
import { HomePage } from './pages/HomePage';

function App() {
  // Start automatic background syncing (hourly)
  useAutoProductSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Future routes */}
        {/* <Route path="/event/:id" element={<EventDetailPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
