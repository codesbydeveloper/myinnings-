import { getTeamInitials } from '../../utils/helpers'

const SIZES = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-[4.5rem] w-[4.5rem] text-xl',
}

export default function TeamLogo({ team, size = 'md' }) {
  const className = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-bold text-white ${SIZES[size] ?? SIZES.md}`

  if (team?.logo) {
    return (
      <img
        src={team.logo}
        alt={`${team.name} logo`}
        className={`${className} object-cover`}
      />
    )
  }

  return (
    <span
      className={className}
      style={{ backgroundColor: team?.colors?.primary || '#059669' }}
    >
      {team?.shortName || getTeamInitials(team?.name)}
    </span>
  )
}
