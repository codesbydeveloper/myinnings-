/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { decorateNotification, SEED_NOTIFICATIONS } from '../data/notificationModel'
import { AUTH_STORAGE_KEYS } from '../utils/constants'
import { createId } from '../utils/helpers'
import {
  DEFAULT_PREFERENCES,
  emitNotification,
  onNotification,
  preferenceAllows,
  resolveRecipientIds,
  typeToPreference,
} from '../utils/inbox'
import { loadUsers, readJson, writeJson } from '../utils/storage'
import { useAuth } from './AuthContext'
import { useTeams } from './TeamContext'

const NotificationContext = createContext(null)

function persistNotifications(notifications) {
  writeJson(AUTH_STORAGE_KEYS.notificationStore, { notifications })
}

function persistPrefs(map) {
  writeJson(AUTH_STORAGE_KEYS.notificationPrefs, map)
}

function loadNotifications() {
  const stored = readJson(AUTH_STORAGE_KEYS.notificationStore, null)
  if (stored?.notifications) {
    return stored.notifications.map((item) => decorateNotification(item))
  }
  const seeded = SEED_NOTIFICATIONS.map((item) => decorateNotification(item))
  persistNotifications(seeded)
  return seeded
}

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const [notifications, setNotifications] = useState(loadNotifications)
  const [prefMap, setPrefMap] = useState(() => readJson(AUTH_STORAGE_KEYS.notificationPrefs, {}))

  const save = useCallback((next) => {
    persistNotifications(next)
    setNotifications(next)
  }, [])

  const createForRecipients = useCallback(
    (payload) => {
      const users = loadUsers()
      const recipientIds = resolveRecipientIds(payload, teams, players)
      if (!recipientIds.length) return []
      const preferenceKey = payload.preferenceKey || typeToPreference(payload.type, payload.category)
      const created = []
      setNotifications((current) => {
        created.length = 0
        recipientIds.forEach((userId) => {
          if (payload.excludeUserIds?.includes(userId)) return
          if (!preferenceAllows(userId, preferenceKey)) return
          const duplicate = current.some(
            (item) =>
              item.userId === userId &&
              item.type === payload.type &&
              item.relatedEntityId === payload.relatedEntityId &&
              Date.now() - new Date(item.createdAt).getTime() < 8000,
          )
          if (duplicate) return
          const recipient = users.find((item) => item.id === userId)
          created.push(
            decorateNotification({
              id: createId('note'),
              title: payload.title,
              message: payload.message,
              type: payload.type,
              category: payload.category || 'System',
              userId,
              role: recipient?.role || '',
              relatedEntityType: payload.relatedEntityType || '',
              relatedEntityId: payload.relatedEntityId || null,
              route: payload.route || '/notifications',
              isRead: false,
              createdAt: new Date().toISOString(),
              icon: payload.icon,
              actorName: payload.actorName || '',
              teamId: payload.teamId || payload.teamIds?.[0] || null,
            }),
          )
        })
        if (!created.length) return current
        const next = [...created, ...current].slice(0, 400)
        persistNotifications(next)
        return next
      })
      return created
    },
    [players, teams],
  )

  useEffect(() => {
    return onNotification((payload) => {
      createForRecipients(payload)
    })
  }, [createForRecipients])

  const myNotifications = useMemo(
    () =>
      notifications
        .filter((item) => item.userId === user?.id)
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    [notifications, user],
  )

  const unreadCount = useMemo(
    () => myNotifications.filter((item) => !item.isRead).length,
    [myNotifications],
  )

  const preferences = useMemo(
    () => ({ ...DEFAULT_PREFERENCES, ...(prefMap[user?.id] || {}) }),
    [prefMap, user],
  )

  const markRead = useCallback(
    (id) => {
      const current = notifications.find((item) => item.id === id)
      if (!current || current.userId !== user?.id) return
      save(notifications.map((item) => (item.id === id ? { ...item, isRead: true } : item)))
    },
    [notifications, save, user],
  )

  const markAllRead = useCallback(() => {
    if (!user?.id) return
    save(
      notifications.map((item) => (item.userId === user.id ? { ...item, isRead: true } : item)),
    )
  }, [notifications, save, user])

  const deleteNotification = useCallback(
    (id) => {
      const current = notifications.find((item) => item.id === id)
      if (!current || current.userId !== user?.id) return false
      save(notifications.filter((item) => item.id !== id))
      return true
    },
    [notifications, save, user],
  )

  const clearRead = useCallback(() => {
    if (!user?.id) return
    save(notifications.filter((item) => item.userId !== user.id || !item.isRead))
  }, [notifications, save, user])

  const updatePreferences = useCallback(
    (nextPrefs) => {
      if (!user?.id) return
      const nextMap = { ...prefMap, [user.id]: { ...DEFAULT_PREFERENCES, ...nextPrefs } }
      persistPrefs(nextMap)
      setPrefMap(nextMap)
    },
    [prefMap, user],
  )

  const getNotification = useCallback(
    (id) => myNotifications.find((item) => item.id === id) ?? null,
    [myNotifications],
  )

  const value = useMemo(
    () => ({
      notifications: myNotifications,
      unreadCount,
      preferences,
      createNotification: createForRecipients,
      markRead,
      markAllRead,
      deleteNotification,
      clearRead,
      updatePreferences,
      getNotification,
      emitNotification,
    }),
    [
      clearRead,
      createForRecipients,
      deleteNotification,
      getNotification,
      markAllRead,
      markRead,
      myNotifications,
      preferences,
      unreadCount,
      updatePreferences,
    ],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
