/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { GROUNDS } from '../data/grounds'
import {
  bookingFromMatch,
  decorateGround,
  findConflicts,
  formatMinutes,
  groundAvailabilityStatus,
  nextCode,
  parseTimeToMinutes,
  todayKey,
} from '../data/groundModel'
import { formatDateKey, formatTimestamp } from '../data/matchModel'
import { AUTH_STORAGE_KEYS } from '../utils/constants'
import {
  canCancelBooking,
  canCreateBooking,
  canCreateGround,
  canDeleteGround,
  canEditGround,
} from '../utils/groundAccess'
import { createId } from '../utils/helpers'
import { readJson, writeJson } from '../utils/storage'
import { emitActivity, emitNotification } from '../utils/inbox'
import { useAuth } from './AuthContext'
import { useMatches } from './MatchContext'
import { useTournaments } from './TournamentContext'

const GroundContext = createContext(null)

const SEED_PRACTICE = [
  {
    id: 'booking-practice-001',
    code: 'BK-2101',
    groundId: 'ground-001',
    groundName: 'Wankhede Practice Ground',
    date: '10 September 2026',
    dateKey: '2026-09-10',
    startTime: '6:00 AM',
    endTime: '9:00 AM',
    startMinutes: 360,
    endMinutes: 540,
    type: 'Practice',
    matchId: null,
    matchTitle: '',
    tournamentId: null,
    tournamentName: '',
    notes: 'Mumbai Warriors morning nets.',
    status: 'Upcoming',
    createdBy: 'Amit Kumar',
    createdDate: '6 September 2026',
    source: 'booking',
  },
  {
    id: 'booking-practice-002',
    code: 'BK-2102',
    groundId: 'ground-003',
    groundName: 'MCA Club, Pune',
    date: '12 September 2026',
    dateKey: '2026-09-12',
    startTime: '7:00 AM',
    endTime: '10:00 AM',
    startMinutes: 420,
    endMinutes: 600,
    type: 'Practice',
    matchId: null,
    matchTitle: '',
    tournamentId: null,
    tournamentName: '',
    notes: 'Pune Panthers training.',
    status: 'Upcoming',
    createdBy: 'Rahul Sharma',
    createdDate: '7 September 2026',
    source: 'booking',
  },
]

function persist(store) {
  writeJson(AUTH_STORAGE_KEYS.groundStore, store)
}

function loadStore() {
  const stored = readJson(AUTH_STORAGE_KEYS.groundStore, null)
  const matchStore = readJson(AUTH_STORAGE_KEYS.matchStore, null)
  const seed = GROUNDS.map((item) => decorateGround(item))
  const customFromMatches = (matchStore?.grounds || []).filter(
    (item) => item?.id && !seed.some((ground) => ground.id === item.id),
  )
  if (stored?.grounds?.length) {
    const known = new Set(stored.grounds.map((item) => item.id))
    return {
      grounds: [
        ...stored.grounds.map((item) => decorateGround(item)),
        ...seed.filter((item) => !known.has(item.id)),
        ...customFromMatches.filter((item) => !known.has(item.id)).map((item) => decorateGround(item)),
      ],
      bookings: stored.bookings || SEED_PRACTICE,
    }
  }
  return {
    grounds: [...seed, ...customFromMatches.map((item) => decorateGround(item))],
    bookings: SEED_PRACTICE,
  }
}

function candidateFromPayload(payload, ground) {
  const startMinutes = parseTimeToMinutes(payload.startTime) ?? parseTimeToMinutes(payload.startInput)
  const endMinutes = parseTimeToMinutes(payload.endTime) ?? parseTimeToMinutes(payload.endInput)
  return {
    groundId: ground.id,
    groundName: ground.name,
    dateKey: payload.dateKey,
    date: payload.date || formatDateKey(payload.dateKey),
    startMinutes,
    endMinutes,
    startTime: formatMinutes(startMinutes),
    endTime: formatMinutes(endMinutes),
    status: 'Upcoming',
  }
}

export function GroundProvider({ children }) {
  const { user } = useAuth()
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const [store, setStore] = useState(loadStore)

  const save = useCallback((next) => {
    persist(next)
    setStore(next)
  }, [])

  const grounds = store.grounds

  const bookings = useMemo(() => {
    const existingMatchIds = new Set(store.bookings.filter((item) => item.matchId).map((item) => item.matchId))
    const derived = matches
      .filter((match) => match.groundId || match.venue || match.ground)
      .filter((match) => !existingMatchIds.has(match.id))
      .map((match) => {
        const record = bookingFromMatch(match)
        const ground =
          grounds.find((item) => item.id === record.groundId) ||
          grounds.find((item) => item.name === record.groundName)
        return {
          ...record,
          groundId: ground?.id || record.groundId,
          groundName: ground?.name || record.groundName,
          tournamentName:
            record.tournamentName ||
            tournaments.find((item) => item.id === match.tournamentId)?.name ||
            '',
        }
      })
      .filter((item) => item.groundId)

    const aligned = store.bookings.map((booking) => {
      if (!booking.matchId) return booking
      const match = matches.find((item) => item.id === booking.matchId)
      if (!match) return booking
      if (booking.status === 'Cancelled') return booking
      if (match.status === 'Cancelled') return { ...booking, status: 'Cancelled' }
      if (match.status === 'Completed') return { ...booking, status: 'Completed' }
      return booking
    })

    return [...aligned, ...derived]
  }, [grounds, matches, store.bookings, tournaments])

  const getGround = useCallback(
    (groundId) => grounds.find((item) => item.id === groundId) ?? null,
    [grounds],
  )

  const availabilityOf = useCallback(
    (ground) => groundAvailabilityStatus(ground, bookings),
    [bookings],
  )

  const addGround = useCallback(
    (payload) => {
      if (!canCreateGround(user?.role)) return null
      const record = decorateGround({
        id: createId('ground'),
        name: payload.name.trim(),
        address: payload.address?.trim() || '',
        city: payload.city.trim(),
        state: payload.state?.trim() || '',
        location: payload.city.trim(),
        description: payload.description?.trim() || '',
        capacity: Number(payload.capacity) || 0,
        pitches: Number(payload.pitches) || 1,
        openingTime: payload.openingTime || '06:00',
        closingTime: payload.closingTime || '21:00',
        facilities: payload.facilities || [],
        image: payload.image || null,
        status: payload.status || 'Available',
      })
      save({ ...store, grounds: [record, ...store.grounds] })
      return record
    },
    [save, store, user],
  )

  const updateGround = useCallback(
    (groundId, payload) => {
      if (!canEditGround(user)) return false
      save({
        ...store,
        grounds: store.grounds.map((item) =>
          item.id === groundId
            ? decorateGround({
                ...item,
                ...payload,
                location: payload.city || payload.location || item.location,
              })
            : item,
        ),
      })
      return true
    },
    [save, store, user],
  )

  const deleteGround = useCallback(
    (groundId) => {
      if (!canDeleteGround(user)) return { ok: false, message: 'You cannot delete grounds.' }
      const upcoming = bookings.filter(
        (item) => item.groundId === groundId && item.status === 'Upcoming' && item.dateKey >= todayKey(),
      )
      if (upcoming.length) {
        return {
          ok: false,
          message: `This ground has ${upcoming.length} upcoming booking${upcoming.length === 1 ? '' : 's'}. Cancel them before deleting.`,
        }
      }
      save({
        ...store,
        grounds: store.grounds.filter((item) => item.id !== groundId),
      })
      return { ok: true }
    },
    [bookings, save, store, user],
  )

  const checkAvailability = useCallback(
    (payload, ignoreId) => {
      const ground = getGround(payload.groundId)
      if (!ground) return { available: false, conflicts: [], message: 'Select a ground.' }
      if (ground.status === 'Under Maintenance') {
        return { available: false, conflicts: [], message: 'This ground is under maintenance.' }
      }
      const candidate = candidateFromPayload(payload, ground)
      if (candidate.startMinutes == null || candidate.endMinutes == null) {
        return { available: false, conflicts: [], message: 'Enter a valid start and end time.' }
      }
      if (candidate.endMinutes <= candidate.startMinutes) {
        return { available: false, conflicts: [], message: 'End time must be after start time.' }
      }
      const conflicts = findConflicts(candidate, bookings, ignoreId)
      if (conflicts.length) {
        const first = conflicts[0]
        return {
          available: false,
          conflicts,
          candidate,
          message: `Ground already booked from ${first.startTime} to ${first.endTime}${
            first.matchTitle ? ` for ${first.matchTitle}` : first.type ? ` (${first.type})` : ''
          }.`,
        }
      }
      return { available: true, conflicts: [], candidate, message: 'Ground available.' }
    },
    [bookings, getGround],
  )

  const createBooking = useCallback(
    (payload) => {
      if (!canCreateBooking(user?.role)) {
        return { ok: false, message: 'You do not have permission to create bookings.' }
      }
      const result = checkAvailability(payload, payload.ignoreId)
      if (!result.available) {
        emitNotification({
          title: 'Booking conflict',
          message: result.message || 'That ground is already booked for the selected time.',
          type: 'booking-conflict',
          category: 'Booking',
          relatedEntityType: 'ground',
          relatedEntityId: payload.groundId,
          route: payload.groundId ? `/grounds/${payload.groundId}` : '/grounds',
          currentUserId: user.id,
          actorName: user.name,
        })
        return { ok: false, message: result.message, conflicts: result.conflicts }
      }
      const tournament = tournaments.find((item) => item.id === payload.tournamentId)
      const linkedMatch = matches.find((item) => item.id === payload.matchId)
      const record = {
        id: createId('booking'),
        code: nextCode('BK', store.bookings),
        ...result.candidate,
        type: payload.type || 'Practice',
        matchId: linkedMatch?.id || payload.matchId || null,
        matchTitle:
          payload.matchTitle ||
          (linkedMatch ? linkedMatch.title || `${linkedMatch.home} vs ${linkedMatch.away}` : ''),
        tournamentId: tournament?.id || linkedMatch?.tournamentId || payload.tournamentId || null,
        tournamentName: tournament?.name || linkedMatch?.tournamentName || payload.tournamentName || '',
        notes: payload.notes?.trim() || '',
        status: 'Upcoming',
        createdBy: user.name,
        createdDate: formatTimestamp(),
        source: 'booking',
      }
      save({ ...store, bookings: [record, ...store.bookings] })
      emitNotification({
        title: 'Ground Booking Confirmed',
        message: `${record.groundName} has been booked${record.matchTitle ? ` for ${record.matchTitle}` : ''}.`,
        type: 'booking-created',
        category: 'Booking',
        relatedEntityType: 'ground',
        relatedEntityId: record.groundId,
        route: `/grounds/${record.groundId}`,
        currentUserId: user.id,
        teamIds: [linkedMatch?.homeTeamId, linkedMatch?.awayTeamId].filter(Boolean),
        staffRoles: ['captain', 'manager'],
        actorName: user.name,
      })
      emitActivity({
        title: 'Ground booking created',
        description: `A new ground booking was created at ${record.groundName}.`,
        category: 'Ground Activity',
        relatedEntityType: 'ground',
        relatedEntityId: record.groundId,
        route: `/grounds/${record.groundId}`,
        actorName: user.name,
        actorId: user.id,
        teamId: linkedMatch?.homeTeamId || null,
        teamIds: [linkedMatch?.homeTeamId, linkedMatch?.awayTeamId].filter(Boolean),
      })
      return { ok: true, booking: record }
    },
    [checkAvailability, matches, save, store, tournaments, user],
  )

  const syncMatchBooking = useCallback(
    (match) => {
      if (!match) return
      const next = bookingFromMatch(match)
      const ground =
        grounds.find((item) => item.id === next.groundId) ||
        grounds.find((item) => item.name === next.groundName)
      const record = {
        ...next,
        groundId: ground?.id || next.groundId,
        groundName: ground?.name || next.groundName,
      }
      if (!record.groundId) return
      const index = store.bookings.findIndex((item) => item.matchId === match.id)
      if (index === -1) {
        save({ ...store, bookings: [record, ...store.bookings] })
        return
      }
      save({
        ...store,
        bookings: store.bookings.map((item, current) =>
          current === index
            ? {
                ...item,
                ...record,
                id: item.id,
                code: item.code,
                status: item.status === 'Cancelled' ? 'Cancelled' : record.status,
              }
            : item,
        ),
      })
    },
    [grounds, save, store],
  )

  const cancelBooking = useCallback(
    (bookingId) => {
      const current = bookings.find((item) => item.id === bookingId)
      if (!current || !canCancelBooking(current, user)) return false
      const stored = store.bookings.some((item) => item.id === bookingId)
      if (stored) {
        save({
          ...store,
          bookings: store.bookings.map((item) =>
            item.id === bookingId ? { ...item, status: 'Cancelled' } : item,
          ),
        })
      } else {
        save({
          ...store,
          bookings: [{ ...current, status: 'Cancelled', source: current.source || 'match' }, ...store.bookings],
        })
      }
      emitNotification({
        title: 'Ground booking cancelled',
        message: `The booking at ${current.groundName} on ${current.date} is now cancelled.`,
        type: 'booking-cancelled',
        category: 'Booking',
        relatedEntityType: 'ground',
        relatedEntityId: current.groundId,
        route: current.groundId ? `/grounds/${current.groundId}` : '/grounds',
        currentUserId: user.id,
        teamIds: current.matchId
          ? [matches.find((item) => item.id === current.matchId)?.homeTeamId].filter(Boolean)
          : [],
        staffRoles: ['captain', 'manager'],
        actorName: user.name,
      })
      emitActivity({
        title: 'Ground booking cancelled',
        description: `A booking at ${current.groundName} was cancelled.`,
        category: 'Ground Activity',
        relatedEntityType: 'ground',
        relatedEntityId: current.groundId,
        route: current.groundId ? `/grounds/${current.groundId}` : '/grounds',
        actorName: user.name,
        actorId: user.id,
      })
      return true
    },
    [bookings, matches, save, store, user],
  )

  const bookingsForGround = useCallback(
    (groundId) => bookings.filter((item) => item.groundId === groundId),
    [bookings],
  )

  const value = useMemo(
    () => ({
      grounds,
      bookings,
      getGround,
      availabilityOf,
      addGround,
      updateGround,
      deleteGround,
      checkAvailability,
      createBooking,
      cancelBooking,
      syncMatchBooking,
      bookingsForGround,
    }),
    [
      addGround,
      availabilityOf,
      bookings,
      bookingsForGround,
      cancelBooking,
      checkAvailability,
      createBooking,
      deleteGround,
      getGround,
      grounds,
      syncMatchBooking,
      updateGround,
    ],
  )

  return <GroundContext.Provider value={value}>{children}</GroundContext.Provider>
}

export function useGrounds() {
  const context = useContext(GroundContext)
  if (!context) {
    throw new Error('useGrounds must be used within GroundProvider')
  }
  return context
}
