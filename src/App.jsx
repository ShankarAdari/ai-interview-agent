import React, { useState, useEffect } from 'react'
import { Brain, Home, Settings, BarChart2, History, Menu, X } from 'lucide-react'
import { InterviewProvider, useInterview } from './context/InterviewContext'
import HomeScreen from './components/HomeScreen'
import SetupScreen from './components/SetupScreen'
import InterviewScreen from './components/InterviewScreen'
import ReportScreen from './components/ReportScreen'
import HistoryScreen from './components/HistoryScreen'
import Background3D from './components/Background3D'
import { Toast } from './components/UI'
import { motion, AnimatePresence } from 'framer-motion'
import { setApiKey } from './services/gemini'

function NavBar() {
  const { state, dispatch } = useInterview()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [historyCount, setHistoryCount] = useState(0)

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('interview_history') || '[]')
      setHistoryCount(h.length)
    } catch (_) {}
  }, [state.screen]) // refresh count when screen changes

  // Hide navbar during active interview session
  if (state.screen === 'interview') return null

  const navItems = [
    { id: 'home',    label: 'Home',         icon: Home },
    { id: 'setup',   label: 'New Interview', icon: Settings },
    { id: 'history', label: 'History',       icon: History, badge: historyCount || null },
    ...(state.report ? [{ id: 'report', label: 'Last Report', icon: BarChart2 }] : []),
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 64,
      background: 'rgba(8, 13, 26, 0.88)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--glass-border)',
    }}>
      {/* Logo */}
      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'home' })}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(108,99,255,0.4)',
        }}>
          <Brain size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700 }}>
          InterviewAI
        </span>
      </button>

      {/* Desktop Nav Links */}
      <div style={{ display: 'flex', gap: 4 }} className="hide-mobile">
        {navItems.map(item => {
          const active = state.screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_SCREEN', payload: item.id })}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 'var(--radius-full)',
                background: active ? 'rgba(108,99,255,0.15)' : 'transparent',
                border: `1px solid ${active ? 'rgba(108,99,255,0.35)' : 'transparent'}`,
                color: active ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: active ? 600 : 500,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
            >
              <item.icon size={15} />
              {item.label}
              {item.badge ? (
                <span style={{
                  position: 'absolute', top: 4, right: 6,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  fontSize: 9, fontWeight: 800, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* CTA + Mobile Menu Toggle */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'setup' })}
          style={{ boxShadow: '0 0 20px rgba(108,99,255,0.3)' }}
        >
          Start Interview
        </button>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: 'none' }}  /* shown via media query if needed */
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  )
}

function AppContent() {
  const { state } = useInterview()
  const [toast, setToast] = useState(null)

  const paddingTop = state.screen !== 'interview' ? '64px' : '0'

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* 3D Background */}
      <Background3D />

      {/* Overlay Grid */}
      <div className="bg-grid" style={{ opacity: 0.3 }} />

      {/* Navigation */}
      <NavBar />

      {/* Main content */}
      <main style={{ position: 'relative', zIndex: 1, paddingTop }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.screen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {state.screen === 'home'      && <HomeScreen />}
            {state.screen === 'setup'     && <SetupScreen />}
            {state.screen === 'interview' && <InterviewScreen />}
            {state.screen === 'history'   && <HistoryScreen />}
            {state.screen === 'report'    && (
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
                <ReportScreen />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default function App() {
  return (
    <InterviewProvider>
      <AppContent />
    </InterviewProvider>
  )
}
