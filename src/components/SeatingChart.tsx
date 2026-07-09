import { useEffect, useState } from 'react';

interface SeatingChartProps {
  imageUrl: string;
  venueName: string;
}

/**
 * Venue seating chart panel with a click-to-zoom lightbox. The chart images
 * are painted in ticket-category colors, so the swatches on the ticket
 * options (see EventDetailPage) map buyers to zones on this chart.
 */
export function SeatingChart({ imageUrl, venueName }: SeatingChartProps) {
  const [zoomed, setZoomed] = useState(false);
  // Sandbox file storage 403s on chart images; hide the whole panel when the
  // image can't load so it only appears where the chart actually renders
  const [imgFailed, setImgFailed] = useState(false);

  // Close the lightbox on Escape
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [zoomed]);

  if (imgFailed) return null;

  return (
    <>
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Seating plan</h2>
          <span className="text-sm text-ink-muted">Click to zoom</span>
        </div>
        <button
          onClick={() => setZoomed(true)}
          className="mt-4 block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-gray-100"
          aria-label={`Zoom seating plan for ${venueName}`}
        >
          <img
            src={imageUrl}
            alt={`Seating plan for ${venueName}`}
            className="w-full object-contain"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        </button>
        <p className="mt-3 text-sm text-ink-muted">
          Zone colors on the plan match the color dots on each ticket option.
        </p>
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Seating plan for ${venueName}`}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink"
            aria-label="Close seating plan"
          >
            ✕
          </button>
          <div
            className="max-h-full max-w-6xl overflow-auto rounded-2xl bg-white p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={`Seating plan for ${venueName}, enlarged`}
              className="min-w-[800px]"
            />
          </div>
        </div>
      )}
    </>
  );
}
