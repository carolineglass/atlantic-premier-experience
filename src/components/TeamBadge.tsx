import { useState } from 'react';
import { getTeamColor, getTeamMonogram } from '@/utils/teamColors';
import teamBadges from '@/data/team-badges.json';

interface TeamBadgeProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES: Record<NonNullable<TeamBadgeProps['size']>, string> = {
  sm: 'w-8 h-8 text-[10px] rounded-lg',
  md: 'w-12 h-12 text-sm rounded-xl',
  lg: 'w-16 h-16 text-lg rounded-2xl',
  xl: 'w-24 h-24 text-2xl rounded-3xl',
};

const IMG_PADDING: Record<NonNullable<TeamBadgeProps['size']>, string> = {
  sm: 'p-0.5',
  md: 'p-1',
  lg: 'p-1.5',
  xl: 'p-2',
};

const BADGE_MAP: Record<string, string> = teamBadges;

/**
 * Club badge for a team. Badge images are fetched at build time by
 * scripts/fetch-team-badges.mjs into public/images/badges/ with a name -> path
 * map in src/data/team-badges.json; teams without a badge (or whose image
 * fails to load) fall back to a deterministic monogram chip.
 */
export function TeamBadge({ name, size = 'md' }: TeamBadgeProps) {
  const badgeSrc = BADGE_MAP[name];
  const [imgFailed, setImgFailed] = useState(false);

  if (badgeSrc && !imgFailed) {
    return (
      <div
        className={`flex flex-shrink-0 items-center justify-center border border-gray-100 bg-white ${SIZE_CLASSES[size]} ${IMG_PADDING[size]}`}
      >
        <img
          src={badgeSrc}
          alt={`${name} club badge`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  const color = getTeamColor(name);
  const monogram = getTeamMonogram(name);

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center font-display font-bold tracking-wide ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: color.bg, color: color.text }}
      aria-hidden="true"
    >
      {monogram}
    </div>
  );
}
