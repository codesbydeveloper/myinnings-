/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { formatRangeLabel, rangeBounds } from '../utils/reportUtils'

const ReportContext = createContext(null)
const STORAGE_KEY = 'myinnings.reportRange'

function loadRange() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return { preset: 'all', start: '', end: '' }
    return { preset: 'all', start: '', end: '', ...JSON.parse(stored) }
  } catch {
    return { preset: 'all', start: '', end: '' }
  }
}

export function ReportProvider({ children }) {
  const [range, setRangeState] = useState(loadRange)

  const setRange = useCallback((next) => {
    setRangeState((current) => {
      const value = typeof next === 'function' ? next(current) : { ...current, ...next }
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* ignore quota */
      }
      return value
    })
  }, [])

  const bounds = useMemo(() => rangeBounds(range), [range])
  const rangeLabel = useMemo(() => formatRangeLabel(range), [range])

  const value = useMemo(
    () => ({
      range,
      setRange,
      bounds,
      rangeLabel,
    }),
    [bounds, range, rangeLabel, setRange],
  )

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
}

export function useReportRange() {
  const context = useContext(ReportContext)
  if (!context) {
    throw new Error('useReportRange must be used within ReportProvider')
  }
  return context
}
