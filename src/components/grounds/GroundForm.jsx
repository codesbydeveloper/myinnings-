import { useState } from 'react'
import { fieldClass } from '../../utils/helpers'
import { FACILITIES } from '../../data/groundModel'
import GroundImage from './GroundImage'

const EMPTY = {
  name: '',
  address: '',
  city: '',
  state: '',
  description: '',
  capacity: '',
  pitches: '1',
  openingTime: '06:00',
  closingTime: '21:00',
  facilities: [],
  image: null,
}

export default function GroundForm({ initial, onSubmit, saving, submitLabel = 'Save Ground' }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          ...EMPTY,
          ...initial,
          capacity: String(initial.capacity || ''),
          pitches: String(initial.pitches || '1'),
          facilities: initial.facilities || [],
        }
      : EMPTY,
  )
  const [error, setError] = useState('')

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function toggleFacility(item) {
    setForm((current) => ({
      ...current,
      facilities: current.facilities.includes(item)
        ? current.facilities.filter((value) => value !== item)
        : [...current.facilities, item],
    }))
  }

  function handleImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 400000) {
      setError('Please choose an image smaller than 400 KB for this prototype.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => update('image', reader.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.city.trim()) {
      setError('Ground name and city are required.')
      return
    }
    if (form.openingTime && form.closingTime && form.closingTime <= form.openingTime) {
      setError('Closing time must be after opening time.')
      return
    }
    onSubmit({
      ...form,
      name: form.name.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      state: form.state.trim(),
      description: form.description.trim(),
      capacity: Number(form.capacity) || 0,
      pitches: Number(form.pitches) || 1,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-800">Basic Information</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase sm:col-span-2">
            Ground Name
            <input className={`mt-1.5 ${fieldClass}`} value={form.name} onChange={(event) => update('name', event.target.value)} />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase sm:col-span-2">
            Address
            <input className={`mt-1.5 ${fieldClass}`} value={form.address} onChange={(event) => update('address', event.target.value)} />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            City
            <input className={`mt-1.5 ${fieldClass}`} value={form.city} onChange={(event) => update('city', event.target.value)} />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            State
            <input className={`mt-1.5 ${fieldClass}`} value={form.state} onChange={(event) => update('state', event.target.value)} />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase sm:col-span-2">
            Description
            <textarea
              rows={4}
              className={`mt-1.5 ${fieldClass}`}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-800">Ground Details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Capacity
            <input
              type="number"
              min="0"
              className={`mt-1.5 ${fieldClass}`}
              value={form.capacity}
              onChange={(event) => update('capacity', event.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Number of Pitches
            <input
              type="number"
              min="1"
              className={`mt-1.5 ${fieldClass}`}
              value={form.pitches}
              onChange={(event) => update('pitches', event.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Opening Time
            <input
              type="time"
              className={`mt-1.5 ${fieldClass}`}
              value={form.openingTime}
              onChange={(event) => update('openingTime', event.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Closing Time
            <input
              type="time"
              className={`mt-1.5 ${fieldClass}`}
              value={form.closingTime}
              onChange={(event) => update('closingTime', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-800">Facilities</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FACILITIES.map((item) => (
            <label key={item} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm">
              <input
                type="checkbox"
                className="accent-emerald-600"
                checked={form.facilities.includes(item)}
                onChange={() => toggleFacility(item)}
              />
              <span className="truncate">{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-800">Ground Image</h2>
        <p className="mt-1 text-xs text-slate-500">Local preview only. Nothing is uploaded to a server.</p>
        <div className="mt-4 overflow-hidden rounded-2xl">
          <GroundImage ground={form} className="h-40 w-full" />
        </div>
        <input type="file" accept="image/*" className="mt-4 w-full text-sm" onChange={handleImage} />
      </section>

      <button
        type="submit"
        disabled={saving}
        className="min-h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
