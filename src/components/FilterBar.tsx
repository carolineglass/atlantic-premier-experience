import { useMemo, useRef, useState, useEffect } from 'react';
import { useFixtureFilters } from '@/hooks/useFixtureFilters';
import type { Competition, Team } from '@/types/static-data';

interface FilterBarProps {
  competitions: Competition[];
  teams: Team[];
}

/** Next 6 months as { value: "YYYY-MM", label: "Aug 2026" } */
function upcomingMonths(): { value: string; label: string }[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
    months.push({ value, label });
  }
  return months;
}

export function FilterBar({ competitions, teams }: FilterBarProps) {
  const { competitionId, teamId, month, setFilter, clearAll, hasFilters } =
    useFixtureFilters();

  const [teamQuery, setTeamQuery] = useState('');
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const teamBoxRef = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((t) => t.id === teamId);
  const months = useMemo(upcomingMonths, []);

  const filteredTeams = useMemo(() => {
    const query = teamQuery.toLowerCase().trim();
    const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name));
    if (!query) return sorted;
    return sorted.filter((t) => t.name.toLowerCase().includes(query));
  }, [teams, teamQuery]);

  // Close the team dropdown on outside click
  useEffect(() => {
    if (!teamDropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!teamBoxRef.current?.contains(e.target as Node)) {
        setTeamDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [teamDropdownOpen]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Competition */}
      <select
        value={competitionId ?? ''}
        onChange={(e) =>
          setFilter('competition', e.target.value || undefined)
        }
        className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink focus:border-ink focus:outline-none"
        aria-label="Filter by competition"
      >
        <option value="">All competitions</option>
        {competitions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Team combobox */}
      <div className="relative" ref={teamBoxRef}>
        {selectedTeam ? (
          <button
            onClick={() => setFilter('team', undefined)}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white"
          >
            {selectedTeam.name}
            <span aria-hidden="true">×</span>
          </button>
        ) : (
          <input
            type="text"
            value={teamQuery}
            onChange={(e) => {
              setTeamQuery(e.target.value);
              setTeamDropdownOpen(true);
            }}
            onFocus={() => setTeamDropdownOpen(true)}
            placeholder="Any team…"
            className="w-44 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold placeholder:font-normal placeholder:text-ink-muted focus:border-ink focus:outline-none"
            aria-label="Filter by team"
          />
        )}
        {teamDropdownOpen && !selectedTeam && filteredTeams.length > 0 && (
          <ul className="absolute z-30 mt-2 max-h-64 w-64 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-2 shadow-card-hover">
            {filteredTeams.map((t) => (
              <li key={t.id}>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setFilter('team', String(t.id));
                    setTeamQuery('');
                    setTeamDropdownOpen(false);
                  }}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Month chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('month', undefined)}
          className={`chip transition-colors ${
            !month
              ? 'bg-ink text-white'
              : 'bg-gray-100 text-ink-soft hover:bg-gray-200'
          }`}
        >
          All dates
        </button>
        {months.map((m) => (
          <button
            key={m.value}
            onClick={() =>
              setFilter('month', month === m.value ? undefined : m.value)
            }
            className={`chip transition-colors ${
              month === m.value
                ? 'bg-ink text-white'
                : 'bg-gray-100 text-ink-soft hover:bg-gray-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-sm font-semibold text-ocean-600 hover:text-ocean-700"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
