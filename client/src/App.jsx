import { useState, useEffect } from 'react'
import './App.css'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Download from './pages/Download'

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [slug, setSlug] = useState(null)

  useEffect(() => {
    const path = window.location.pathname
    if (path.startsWith('/d/')) {
      const s = path.split('/')[2]
      if (s) {
        setSlug(s)
        setCurrentPage('download')
      }
    }
  }, [])

  const navigateTo = (page) => {
    setCurrentPage(page)
    if (page !== 'download') {
      window.history.pushState({}, '', '/')
    }
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('landing')
  }

  if (currentPage === 'download' && slug) {
    return <Download slug={slug} onNavigate={navigateTo} />
  }

  if (currentPage === 'landing') {
    return <Landing onNavigate={navigateTo} />
  }

  if (currentPage === 'login') {
    return <Login onNavigate={navigateTo} onLogin={handleLogin} />
  }

  if (currentPage === 'signup') {
    return <Signup onNavigate={navigateTo} onSignup={handleLogin} />
  }

  if (currentPage === 'dashboard' && isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />
  }

  return <Landing onNavigate={navigateTo} />
}
