import React, { useState } from 'react'
import { Brain, Home, Settings, BarChart2, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { InterviewProvider, useInterview } from './context/InterviewContext'
import HomeScreen from './components/HomeScreen'
import SetupScreen from './components/SetupScreen'
import InterviewScreen from './components/InterviewScreen'
import ReportScreen from './components/ReportScreen'
import { Toast } from './components/UI'

function NavBar() {
  const { state, dispatch } = useInterview()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (state.screen === 'interview') return null // No nav during interview

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'setup', label: 'New Interview', icon: Settings },
    ...(state.report ? [{ id: 'report', label: 'Last Report', icon: BarChart2 }] : []),
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 64,
      background: 'rgba(8, 13, 26, 0.85)',
      backdropFilter: 'blur(20px)',
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
        }}>
          <Brain size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700 }}>InterviewAI</span>
      </button>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => dispatch({ type: 'SET_SCREEN', payload: item.id })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              background: state.screen === item.id ? 'rgba(108,99,255,0.15)' : 'transparent',
              border: `1px solid ${state.screen === item.id ? 'rgba(108,99,255,0.3)' : 'transparent'}`,
              color: state.screen === item.id ? 'var(--accent-secondary)' : 'var(--text-secondary)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        className="btn btn-primary btn-sm"
        onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'setup' })}
      >
        Start Interview
      </button>
    </nav>
  )
}

import Background3D from './components/Background3D'
import { motion, AnimatePresence } from 'framer-motion'

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {state.screen === 'home' && <HomeScreen />}
            {state.screen === 'setup' && <SetupScreen />}
            {state.screen === 'interview' && <InterviewScreen />}
            {state.screen === 'report' && (
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
                <ReportScreen />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast */}
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
