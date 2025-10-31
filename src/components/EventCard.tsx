import type { Product } from '@/types/product';

interface EventCardProps {
  product: Product;
  onClick?: () => void;
}

export function EventCard({ product, onClick }: EventCardProps) {
  const matchDate = new Date(product.match.start.local);
  const formattedDate = matchDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = matchDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
    >
      {/* Event Image - Placeholder for now */}
      <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-center px-4">
          <p className="text-2xl font-bold">{product.name}</p>
          <p className="text-sm mt-2 opacity-90">Premier League</p>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium">{formattedDate}</span>
          <span className="text-gray-400">•</span>
          <span>{formattedTime}</span>
        </div>

        {/* Match Type */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {product.type.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Status Badge */}
        {product.match.status === 'Upcoming' && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">
              Available Now
            </span>
          </div>
        )}

        {/* CTA Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
          View Tickets
        </button>
      </div>
    </div>
  );
}
