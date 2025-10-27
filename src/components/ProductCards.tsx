import type { Product } from '@/types/product';

interface ProductCardsProps {
  products: Product[];
}

export function ProductCards({ products }: ProductCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded p-4 bg-white">
          <h3 className="font-bold text-lg mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Status: {product.match.status}
          </p>

          {/* JSON response */}
          <details>
            <summary className="cursor-pointer text-sm text-blue-600 mb-2">
              View Data
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(product, null, 2)}
            </pre>
          </details>
        </div>
      ))}
    </div>
  );
}
