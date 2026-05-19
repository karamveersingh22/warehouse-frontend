import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('wms_token')
    const role  = localStorage.getItem('wms_role')
    const username = localStorage.getItem('wms_username')
    if (token && role) {
      setUser({ token, role, username })
    }
    setLoading(false)
  }, [])

  const login = (token, role, username) => {
    localStorage.setItem('wms_token', token)
    localStorage.setItem('wms_role', role)
    localStorage.setItem('wms_username', username)
    setUser({ token, role, username })
  }

  const logout = () => {
    localStorage.removeItem('wms_token')
    localStorage.removeItem('wms_role')
    localStorage.removeItem('wms_username')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
