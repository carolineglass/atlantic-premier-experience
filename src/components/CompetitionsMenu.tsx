import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompetitionsWithTeams } from '@/hooks/useCompetitionsWithTeams';
import { getAccent } from '@/utils/accentColors';

/**
 * Header mega-menu (desktop): pick a league on the left, its teams appear on
 * the right. Team links go to /fixtures?team=<id>; "Show all <league>" goes
 * to /fixtures?competition=<id>.
 */
export function CompetitionsMenu() {
  const competitions = useCompetitionsWithTeams();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (competitions.length === 0) return null;

  const active =
    competitions.find((c) => c.competition.id === activeId) ?? competitions[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          open ? 'bg-gray-100 text-ink' : 'text-ink-soft hover:bg-gray-100 hover:text-ink'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Competitions
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 flex w-[44rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card-hover">
          {/* Leagues */}
          <ul className="w-60 flex-shrink-0 border-r border-gray-100 bg-gray-50 py-3">
            {competitions.map(({ competition, matchCount }) => (
              <li key={competition.id}>
                <button
                  onMouseEnter={() => setActiveId(competition.id)}
                  onClick={() => setActiveId(competition.id)}
                  className={`flex w-full items-center justify-between gap-2 px-5 py-2.5 text-left text-sm font-semibold transition-colors ${
                    active.competition.id === competition.id
                      ? 'bg-white text-ink'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 rounded-full ${getAccent(competition.id).dot}`}
                    />
                    {competition.name}
                  </span>
                  <span className="text-xs font-normal text-ink-muted">
                    {matchCount}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Teams of the active league */}
          <div className="flex-1 p-5">
            <div className="grid grid-cols-2 gap-x-4">
              {active.teams.slice(0, 14).map((team) => (
                <Link
                  key={team.id}
                  to={`/fixtures?team=${team.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-gray-50 hover:text-ink"
                >
                  {team.name}
                </Link>
              ))}
            </div>
            <Link
              to={`/fixtures?competition=${active.competition.id}`}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center gap-1.5 px-3 text-sm font-semibold text-ocean-600 hover:text-ocean-700"
            >
              Show all {active.competition.name} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile version: accordion of leagues inside the hamburger menu.
 */
export function MobileCompetitions({ onNavigate }: { onNavigate: () => void }) {
  const competitions = useCompetitionsWithTeams();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div>
      {competitions.map(({ competition, teams }) => {
        const expanded = expandedId === competition.id;
        return (
          <div key={competition.id}>
            <button
              onClick={() => setExpandedId(expanded ? null : competition.id)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-semibold text-ink-soft"
              aria-expanded={expanded}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${getAccent(competition.id).dot}`}
                />
                {competition.name}
              </span>
              <span aria-hidden="true">{expanded ? '−' : '+'}</span>
            </button>
            {expanded && (
              <div className="pb-2 pl-9">
                {teams.slice(0, 14).map((team) => (
                  <Link
                    key={team.id}
                    to={`/fixtures?team=${team.id}`}
                    onClick={onNavigate}
                    className="block py-2 text-sm text-ink-soft"
                  >
                    {team.name}
                  </Link>
                ))}
                <Link
                  to={`/fixtures?competition=${competition.id}`}
                  onClick={onNavigate}
                  className="block py-2 text-sm font-semibold text-ocean-600"
                >
                  Show all {competition.name} →
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
