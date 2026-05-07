import React, { useState, useEffect } from 'react'
import { History, Trash2, RefreshCw, TrendingUp, Award, Calendar, Target, ChevronRight } from 'lucide-react'
import { useInterview } from '../context/InterviewContext'
import { motion, AnimatePresence } from 'framer-motion'

function GradeBadge({ grade }) {
  const map = {
    'A+': '#10b981', A: '#10b981',
    'B+': '#22d3ee', B: '#22d3ee',
    'C+': '#f59e0b', C: '#f59e0b',
    D: '#f43f5e', F: '#f43f5e',
  }
  const color = map[grade] || '#94a3c0'
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      background: `${color}18`, border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 900, color, flexShrink: 0
    }}>
      {grade || '?'}
    </div>
  )
}

function VerdictPill({ verdict }) {
  const map = {
    'Strongly Recommended': { color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.1)' },
    'Recommended':          { color: 'var(--accent-cyan)',    bg: 'rgba(34,211,238,0.1)' },
    'Consider':             { color: 'var(--accent-amber)',   bg: 'rgba(245,158,11,0.1)' },
    'Not Recommended':      { color: 'var(--accent-rose)',    bg: 'rgba(244,63,94,0.1)' },
  }
  const style = map[verdict] || map['Consider']
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      background: style.bg, color: style.color,
      fontSize: 11, fontWeight: 700
    }}>
      {verdict || 'N/A'}
    </span>
  )
}

function ScoreBar({ score }) {
  const color = score >= 80 ? 'var(--accent-emerald)'
    : score >= 60 ? 'var(--accent-cyan)'
    : score >= 40 ? 'var(--accent-amber)'
    : 'var(--accent-rose)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 2 }}
        />
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color, minWidth: 36, textAlign: 'right' }}>{score}%</span>
    </div>
  )
}

export default function HistoryScreen() {
  const { dispatch } = useInterview()
  const [sessions, setSessions] = useState([])
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('interview_history') || '[]')
      setSessions(history)
    } catch (_) { setSessions([]) }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('interview_history')
    setSessions([])
    setConfirmClear(false)
  }

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length)
    : 0

  const bestSession = sessions.reduce((best, s) => (!best || s.score > best.score) ? s : best, null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  }
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 120px' }}>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}
      >
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px',
            background: 'rgba(108,99,255,0.1)', borderRadius: 8,
            fontSize: 11, fontWeight: 800, color: 'var(--accent-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16
          }}>
            <History size={13} /> Session Archive
          </div>
          <h1 className="heading-hero" style={{ fontSize: '2.8rem', lineHeight: 1 }}>
            Interview <span className="text-gradient">History</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 10 }}>
            Track your progress and revisit past performance metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {sessions.length > 0 && (
            <AnimatePresence mode="wait">
              {confirmClear ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', gap: 8 }}
                >
                  <button className="btn btn-danger btn-sm" onClick={clearHistory}>Confirm Delete</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(false)}>Cancel</button>
                </motion.div>
              ) : (
                <motion.button
                  key="delete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="btn btn-ghost"
                  style={{ border: '1px solid rgba(244,63,94,0.3)', color: 'var(--accent-rose)' }}
                  onClick={() => setConfirmClear(true)}
                >
                  <Trash2 size={16} /> Clear History
                </motion.button>
              )}
            </AnimatePresence>
          )}
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'FULL_RESET' })}>
            <RefreshCw size={16} /> New Session
          </button>
        </div>
      </motion.div>

      {sessions.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass"
          style={{ padding: 80, textAlign: 'center' }}
        >
          <History size={56} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>No Sessions Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
            Complete your first interview to see your history here.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => dispatch({ type: 'FULL_RESET' })}>
            Start Your First Session
          </button>
        </motion.div>
      ) : (
        <>
          {/* Stats Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}
          >
            {[
              { icon: <History size={20} color="var(--accent-primary)" />, label: 'Total Sessions', value: sessions.length },
              { icon: <TrendingUp size={20} color="var(--accent-cyan)" />, label: 'Average Score', value: `${avgScore}%` },
              {
                icon: <Award size={20} color="var(--accent-amber)" />, label: 'Best Score',
                value: bestSession ? `${bestSession.score}%` : 'N/A'
              },
              {
                icon: <Target size={20} color="var(--accent-emerald)" />, label: 'Top Topic',
                value: bestSession?.topic || 'N/A'
              },
            ].map(({ icon, label, value }) => (
              <motion.div key={label} variants={itemVariants} className="glass" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Session List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {sessions.map((session, idx) => (
              <motion.div
                key={session.id}
                variants={itemVariants}
                className="glass glass-hover"
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
              >
                {/* Index */}
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', minWidth: 28 }}>
                  #{sessions.length - idx}
                </span>

                {/* Grade */}
                <GradeBadge grade={session.grade} />

                {/* Meta */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    {session.topic}
                    {session.role && <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>· {session.role}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Calendar size={11} />
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>
                      {session.difficulty || 'N/A'}
                    </span>
                    <VerdictPill verdict={session.verdict} />
                  </div>
                </div>

                {/* Score Bar */}
                <div style={{ minWidth: 200, flex: 0.6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>Score</div>
                  <ScoreBar score={session.score} />
                </div>

                {/* Hire probability */}
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Hire Prob.</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-cyan)' }}>{session.hiringProbability}%</div>
                </div>

                <ChevronRight size={18} color="var(--text-muted)" />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}
