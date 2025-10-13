import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['test'],
    queryFn: () => apiClient.get('/product'),
    retry: false, // Don't retry on auth errors
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <p className="text-gray-600 mt-4">Authenticating with API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">❌</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-red-900 mb-4">
                {errorMessage}
              </h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎫 Atlantic Premier Experience
        </h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-semibold">
            ✅ API Authentication Successful!
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">API Response:</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
