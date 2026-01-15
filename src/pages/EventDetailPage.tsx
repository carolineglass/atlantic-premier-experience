import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useStaticData } from '@/hooks/useStaticData';
import { useProductInventory } from '@/hooks/useInventory';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Extract product ID from URL parameter (format: "/event/123/slug")
  const productId = id ? parseInt(id, 10) : undefined;

  const { data: product, isLoading: productLoading, error: productError } = useProductDetail(productId);
  const { data: inventory, isLoading: inventoryLoading } = useProductInventory(productId);
  const { data: staticData, isLoading: staticDataLoading } = useStaticData();

  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});

  // Wait for all data to load
  if (productLoading || inventoryLoading || staticDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading event details...</div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl mb-4">Event not found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Get team/venue/competition names from static data
  const homeTeamName = staticData?.teams.find((t) => t.id === product.match.home)?.name;
  const awayTeamName = staticData?.teams.find((t) => t.id === product.match.away)?.name;
  const venueName = staticData?.venues.find((v) => v.id === product.venue)?.name;
  const competitionName = staticData?.competitions.find((c) => c.id === product.match.competition)?.name;

  const matchDate = new Date(product.match.start.local);
  const formattedDate = matchDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = matchDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const availableTickets = inventory?.ticket_options.filter((t) => t.available) || [];
  const isSoldOut = availableTickets.length === 0;

  const handleQuantityChange = (ticketId: number, quantity: number) => {
    setSelectedTickets((prev) => {
      if (quantity === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: quantity };
    });
  };

  const totalItems = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
    const ticket = availableTickets.find((t) => t.id === parseInt(ticketId, 10));
    return sum + (ticket ? ticket.price * qty : 0);
  }, 0);

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', selectedTickets);
    alert(`Added ${totalItems} ticket(s) to cart. Total: £${totalPrice.toFixed(2)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-900/50 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <span>←</span> Back to Events
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Match Header */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {competitionName || `Competition ${product.match.competition}`}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  product.match.status === 'Upcoming'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                }`}>
                  {product.match.status}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {homeTeamName || `Team ${product.match.home}`} vs{' '}
                {awayTeamName || `Team ${product.match.away}`}
              </h1>

              <div className="flex flex-wrap gap-4 text-gray-300 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📅</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">🕐</span>
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📍</span>
                  <span>{venueName || `Venue ${product.venue}`}</span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            {product.information && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Event Information</h2>
                <div
                  className="text-gray-300 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.information }}
                />
              </div>
            )}

            {/* Notes */}
            {product.notes && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Important Notes</h2>
                <div
                  className="text-gray-300 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.notes }}
                />
              </div>
            )}

            {/* Timetable */}
            {product.timetable && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Event Timetable</h2>
                <div
                  className="text-gray-300 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.timetable }}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl sticky top-4">
              <h2 className="text-2xl font-bold text-white mb-6">Select Tickets</h2>

              {isSoldOut ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-lg font-semibold mb-2">Sold Out</div>
                  <p className="text-gray-400">No tickets currently available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{ticket.name}</h3>
                          <p className="text-2xl font-bold text-blue-400 mt-1">
                            £{ticket.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                          Available
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-gray-400 text-sm">Quantity:</label>
                        <select
                          value={selectedTickets[ticket.id] || 0}
                          onChange={(e) =>
                            handleQuantityChange(ticket.id, parseInt(e.target.value, 10))
                          }
                          className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        >
                          {Array.from(
                            { length: Math.min(ticket.max_purchase_qty, 10) + 1 },
                            (_, i) => i
                          ).map((qty) => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>

                      {ticket.max_purchase_qty && (
                        <p className="text-gray-500 text-xs mt-2">
                          Max {ticket.max_purchase_qty} per order
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cart Summary */}
              {totalItems > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between text-white mb-2">
                    <span>Items:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-white text-xl font-bold mb-4">
                    <span>Total:</span>
                    <span>£{totalPrice.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              )}

              {!isSoldOut && totalItems === 0 && (
                <p className="text-gray-500 text-center mt-6 text-sm">
                  Select ticket quantities above
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
