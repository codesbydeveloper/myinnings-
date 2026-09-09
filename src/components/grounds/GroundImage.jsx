import { getTeamInitials } from '../../utils/helpers'

const TONES = ['#059669', '#0f766e', '#1d4ed8', '#7c3aed', '#b45309', '#be123c']

export default function GroundImage({ ground, className = 'h-40 w-full' }) {
  if (ground?.image) {
    return (
      <img
        src={ground.image}
        alt=""
        className={`object-cover ${className}`}
      />
    )
  }

  const tone = TONES[(ground?.name || 'G').length % TONES.length]
  return (
    <div
      className={`flex items-center justify-center text-lg font-semibold text-white ${className}`}
      style={{ background: `linear-gradient(135deg, ${tone}, #0f172a)` }}
      aria-hidden="true"
    >
      {getTeamInitials(ground?.name || 'Ground')}
    </div>
  )
}
