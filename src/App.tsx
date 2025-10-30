import { useState, useMemo } from 'react';
import { ProductCards } from './components/ProductCards';
import {
  useAutoProductSync,
  useStoredProducts,
  useProductSync,
} from './hooks/useProductSync';

function App() {
  // Start automatic background syncing (hourly)
  useAutoProductSync();

  // Get products from localStorage
  const { data: allProducts = [], isLoading } = useStoredProducts();

  // Manual sync hook (for "Sync Now" button)
  const { mutate: syncNow, isPending: isSyncing } = useProductSync();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 12;

  // Client-side filtering and pagination
  const { filteredProducts, totalPages } = useMemo(() => {
    let filtered = allProducts;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.type.toLowerCase().includes(query)
      );
    }

    const total = Math.ceil(filtered.length / itemsPerPage);
    return { filteredProducts: filtered, totalPages: total };
  }, [allProducts, searchQuery]);

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Show loading spinner only on first-time load (no products in localStorage)
  const isFirstTimeLoad = isLoading || (allProducts.length === 0 && !isLoading);

  if (isFirstTimeLoad && allProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading products from API...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Atlantic Premier Experience</h1>
          <button
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔍 Search
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>

        {allProducts.length > 0 && (
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} of {allProducts.length} products
            {searchQuery && ` (searching for "${searchQuery}")`}
          </p>
        )}
      </header>

      <ProductCards products={paginatedProducts} />

      {/* Simple pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center p-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
