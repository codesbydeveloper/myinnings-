import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icons'

export default function ActionMenu({ items = [], align = 'right' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handleClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!items.length) return null

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        aria-label="More options"
        aria-expanded={open}
      >
        <Icon name="moreVertical" className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className={`absolute z-20 mt-1 min-w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false)
                item.onClick?.()
              }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                item.tone === 'danger' ? 'text-red-600' : 'text-slate-700'
              }`}
            >
              {item.icon ? <Icon name={item.icon} className="h-4 w-4" /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
