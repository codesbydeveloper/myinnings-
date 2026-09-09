/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { decorateActivity, isActivityVisible, SEED_ACTIVITIES } from '../data/activityModel'
import { AUTH_STORAGE_KEYS, TOURNAMENT_WIP } from '../utils/constants'
import { isTournamentActivity } from '../utils/tournamentWip'
import { createId } from '../utils/helpers'
import { emitActivity, onActivity } from '../utils/inbox'
import { readJson, writeJson } from '../utils/storage'
import { useAuth } from './AuthContext'
import { useTeams } from './TeamContext'

const ActivityContext = createContext(null)

function persist(activities) {
  writeJson(AUTH_STORAGE_KEYS.activityStore, { activities })
}

function loadActivities() {
  const stored = readJson(AUTH_STORAGE_KEYS.activityStore, null)
  if (stored?.activities) {
    return stored.activities.map((item) => decorateActivity(item))
  }
  const seeded = SEED_ACTIVITIES.map((item) => decorateActivity(item))
  persist(seeded)
  return seeded
}

export function ActivityProvider({ children }) {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const [activities, setActivities] = useState(loadActivities)

  const logActivity = useCallback((payload) => {
    let record = null
    setActivities((current) => {
      const duplicate = current.some(
        (item) =>
          item.title === payload.title &&
          item.relatedEntityId === payload.relatedEntityId &&
          Date.now() - new Date(item.createdAt).getTime() < 8000,
      )
      if (duplicate) return current
      record = decorateActivity({
        id: createId('act'),
        title: payload.title,
        description: payload.description,
        category: payload.category || 'System Activity',
        relatedEntityType: payload.relatedEntityType || '',
        relatedEntityId: payload.relatedEntityId || null,
        route: payload.route || '/activity',
        actorName: payload.actorName || payload.actor || '',
        actorId: payload.actorId || null,
        teamId: payload.teamId || payload.teamIds?.[0] || null,
        teamIds: payload.teamIds || (payload.teamId ? [payload.teamId] : []),
        userIds: payload.userIds || [],
        icon: payload.icon,
        createdAt: new Date().toISOString(),
      })
      const next = [record, ...current].slice(0, 400)
      persist(next)
      return next
    })
    return record
  }, [])

  useEffect(() => onActivity((payload) => logActivity(payload)), [logActivity])

  const visibleActivities = useMemo(
    () =>
      activities
        .filter((item) => isActivityVisible(item, user, teams, players))
        .filter((item) => !TOURNAMENT_WIP || !isTournamentActivity(item))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    [activities, players, teams, user],
  )

  const value = useMemo(
    () => ({
      activities: visibleActivities,
      logActivity,
      emitActivity,
    }),
    [logActivity, visibleActivities],
  )

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export function useActivity() {
  const context = useContext(ActivityContext)
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider')
  }
  return context
}
