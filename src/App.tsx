import { useState } from 'react';
import { ProductCards } from './components/ProductCards';
import { useProducts } from './hooks/useProducts';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: response,
    isLoading,
    error,
  } = useProducts({
    page: {
      number: currentPage,
      size: 12,
    },
    search: searchQuery || undefined,
  });

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error.message}</div>;
  }

  const products = response?.data || [];

  return (
    <div>
      <header className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">Atlantic Premier Experience</h1>
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
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>

        <p className="text-gray-600 mt-2">
          {response?.meta.total} total products
          {searchQuery && ` (searching for "${searchQuery}")`}
        </p>
      </header>

      <ProductCards products={products} />

      {/* Simple pagination */}
      <div className="flex gap-2 justify-center p-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {response?.meta.last_page}
        </span>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === response?.meta.last_page}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
