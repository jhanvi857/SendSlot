import { useState, useEffect } from 'react'
import './App.css'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Download from './pages/Download'

function getInitialRoute() {
  if (typeof window === 'undefined') {
    return { currentPage: 'landing', slug: null as string | null, user: null as any }
  }

  const path = window.location.pathname
  if (path.startsWith('/d/')) {
    const slug = path.split('/')[2] || null
    if (slug) {
      return { currentPage: 'download', slug, user: null as any }
    }
  }

  const savedUser = localStorage.getItem('sendslot_user')
  if (savedUser) {
    return { currentPage: 'dashboard', slug: null as string | null, user: JSON.parse(savedUser) }
  }

  return { currentPage: 'landing', slug: null as string | null, user: null as any }
}

export default function App() {
  const initialRoute = getInitialRoute()
  const [currentPage, setCurrentPage] = useState<string>(initialRoute.currentPage)
  const [user, setUser] = useState<any>(initialRoute.user)
  const [slug, setSlug] = useState<string | null>(initialRoute.slug)

  const [activeNav, setActiveNav] = useState<string>('transfers')

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path.startsWith('/d/')) {
        const s = path.split('/')[2]
        if (s) {
          setSlug(s)
          setCurrentPage('download')
          return
        }
      }

      const savedUser = localStorage.getItem('sendslot_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
        setCurrentPage('dashboard')
        return
      }

      setSlug(null)
      setCurrentPage('landing')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateTo = (page: string) => {
    setCurrentPage(page)
    if (page !== 'download') {
      window.history.pushState({}, '', '/')
    }
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem('sendslot_user', JSON.stringify(userData))
    setActiveNav('transfers')
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('sendslot_user')
    setActiveNav('transfers')
    setCurrentPage('landing')
  }

  if (currentPage === 'download' && slug) {
    return <Download slug={slug} onNavigate={navigateTo} />
  }

  if (currentPage === 'landing') {
    return <Landing onNavigate={navigateTo} user={user} onLogout={handleLogout} setActiveNav={setActiveNav} />
  }

  if (currentPage === 'login') {
    return <Login onNavigate={navigateTo} onLogin={handleLogin} />
  }

  if (currentPage === 'signup') {
    return <Signup onNavigate={navigateTo} onSignup={handleLogin} />
  }

  if (currentPage === 'dashboard' && user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onNavigate={navigateTo}
      />
    )
  }

  return <Landing onNavigate={navigateTo} user={user} onLogout={handleLogout} setActiveNav={setActiveNav} />
}
