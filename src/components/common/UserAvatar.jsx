import { getInitials } from '../../utils/helpers'

export default function UserAvatar({
  name,
  initials,
  src,
  className = 'h-9 w-9 text-xs',
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        className={`inline-flex shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-500 font-semibold text-slate-950 ${className}`}
    >
      {initials || getInitials(name)}
    </span>
  )
}
