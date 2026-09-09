/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { PENDING_REGISTRATIONS } from '../data/tournaments'
import { AVAILABILITY_REQUESTS } from '../data/users'
import { AUTH_STORAGE_KEYS } from '../utils/constants'
import { readJson, writeJson } from '../utils/storage'

const AppContext = createContext(null)

function defaultAvailability() {
  return Object.fromEntries(
    AVAILABILITY_REQUESTS.map((item) => [item.id, item.status]),
  )
}

function defaultRegistrations() {
  return PENDING_REGISTRATIONS
}

export function AppProvider({ children }) {
  const [availability, setAvailabilityState] = useState(() =>
    readJson(AUTH_STORAGE_KEYS.availability, defaultAvailability()),
  )
  const [registrations, setRegistrations] = useState(() =>
    readJson(AUTH_STORAGE_KEYS.registrations, defaultRegistrations()),
  )

  const setAvailability = useCallback((id, status) => {
    setAvailabilityState((current) => {
      const next = { ...current, [id]: status }
      writeJson(AUTH_STORAGE_KEYS.availability, next)
      return next
    })
  }, [])

  const approveRegistration = useCallback((id) => {
    setRegistrations((current) => {
      const next = current.map((item) =>
        item.id === id ? { ...item, status: 'Approved' } : item,
      )
      writeJson(AUTH_STORAGE_KEYS.registrations, next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      availability,
      setAvailability,
      registrations,
      approveRegistration,
    }),
    [availability, setAvailability, registrations, approveRegistration],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within AppProvider')
  }
  return context
}
