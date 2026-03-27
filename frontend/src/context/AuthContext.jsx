import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, loginUser, registerUser, updateProfile as apiUpdateProfile, changePassword as apiChangePassword } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const boot = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await getCurrentUser()
        setUser(res.data)
      } catch (err) {
        localStorage.removeItem('token')
        setToken('')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [token])

  const login = async (payload) => {
    const res = await loginUser(payload)
    const nextToken = res.data?.token || ''
    if (nextToken) {
      localStorage.setItem('token', nextToken)
      setToken(nextToken)
      setUser(res.data)
    }
    return res
  }

  const register = async (payload) => {
    const res = await registerUser(payload)
    const nextToken = res.data?.token || ''
    if (nextToken) {
      localStorage.setItem('token', nextToken)
      setToken(nextToken)
      setUser(res.data)
    }
    return res
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
  }

  const updateProfile = async (payload) => {
    const res = await apiUpdateProfile(payload)
    setUser(res.data)
    return res
  }

  const changePassword = async (payload) => {
    return apiChangePassword(payload)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      setUser,
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
