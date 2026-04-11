import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])
  const login = async (email, password, onLoginSuccess) => {
    try {
      console.log('1. Sending login request...')
      const res = await api.post('/auth/login', { username: email, password })
      
      console.log('2. Login response:', res.data)
      
      console.log('3. Saving token:', res.data.access_token)
      localStorage.setItem('token', res.data.access_token)
      
      console.log('4. Fetching /auth/me...')
      const me = await api.get('/auth/me')
      
      console.log('5. User data:', me.data)
      
      // Set context state
      setUser(me.data)
      
      // Ensure state flush completes before navigation happens
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess(me.data)
        }, 0)
      }
      
      return me.data
    } catch (err) {
      console.error('Login error in AuthContext:', err)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
