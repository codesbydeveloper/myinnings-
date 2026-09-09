/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import {
  clearRememberedEmail,
  clearSession,
  loadSession,
  loadUsers,
  saveRememberedEmail,
  saveSession,
  saveUsers,
} from '../utils/storage'
import { simulateRequest, toSessionUser } from '../utils/helpers'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession())

  const value = useMemo(() => {
    function login({ email, password, remember }) {
      return simulateRequest().then(() => {
        const users = loadUsers()
        const match = users.find(
          (item) =>
            item.email.toLowerCase() === email.trim().toLowerCase() &&
            item.password === password,
        )

        if (!match) {
          return {
            ok: false,
            message: 'Invalid email or password. Try a demo account below.',
          }
        }

        const sessionUser = toSessionUser(match)
        setUser(sessionUser)
        saveSession(sessionUser)

        if (remember) saveRememberedEmail(sessionUser.email)
        else clearRememberedEmail()

        return { ok: true, user: sessionUser }
      })
    }

    function register(payload) {
      return simulateRequest(900).then(() => {
        const users = loadUsers()
        const email = payload.email.trim().toLowerCase()

        if (users.some((item) => item.email.toLowerCase() === email)) {
          return {
            ok: false,
            message: 'An account with this email already exists. Please sign in.',
          }
        }

        const newUser = {
          id: `user-${Date.now()}`,
          name: payload.name.trim(),
          email: payload.email.trim(),
          role: payload.role,
          avatar: null,
          password: payload.password,
          mobile: payload.mobile.trim(),
        }

        saveUsers([...users, newUser])
        const sessionUser = toSessionUser(newUser)
        setUser(sessionUser)
        saveSession(sessionUser)
        return { ok: true, user: sessionUser }
      })
    }

    function logout() {
      setUser(null)
      clearSession()
    }

    return {
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
