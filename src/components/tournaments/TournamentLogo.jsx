import { getTeamInitials } from '../../utils/helpers'

const SIZES = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
}

export default function TournamentLogo({ tournament, size = 'md' }) {
  const className = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-bold text-white ${SIZES[size] ?? SIZES.md}`
  if (tournament?.logo) {
    return <img src={tournament.logo} alt="" className={`${className} object-cover`} />
  }
  return (
    <span className={className} style={{ backgroundColor: '#059669' }}>
      {getTeamInitials(tournament?.name)}
    </span>
  )
}
