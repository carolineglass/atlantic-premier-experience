import { useState } from 'react';
import { ProductCards } from './components/ProductCards';
import { useProducts } from './hooks/useProducts';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: response,
    isLoading,
    error,
  } = useProducts({
    page: {
      number: currentPage,
      size: 12,
    },
  });
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
        <p className="text-gray-600">{response?.meta.total} total products</p>
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
