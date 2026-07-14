import teamStadiums from '@/data/team-stadiums.json';
import type { StadiumImage } from '@/utils/stadiumImages';

/**
 * Attribution page for the stadium photography — most images are Creative
 * Commons (CC BY / CC BY-SA) from Wikimedia Commons, which requires author
 * and license to be credited.
 */
export function CreditsPage() {
  const entries = Object.entries(teamStadiums as Record<string, StadiumImage>)
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Photo credits
      </h1>
      <p className="mt-4 text-ink-muted">
        Stadium photography on this site comes from{' '}
        <a
          href="https://commons.wikimedia.org"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-ocean-600 hover:text-ocean-700"
        >
          Wikimedia Commons
        </a>{' '}
        under the licenses listed below. Thank you to the photographers.
      </p>

      <ul className="mt-10 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
        {entries.map(([team, info]) => (
          <li
            key={team}
            className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <span className="font-display font-bold">{team}</span>
            <span className="text-sm text-ink-muted">
              {info.credit} · {info.license}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
