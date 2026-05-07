import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

// ---- Voice waveform bars ----
export function VoiceWave({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: active ? `${6 + Math.random() * 20}px` : '6px',
            background: 'var(--accent-primary)',
            borderRadius: 2,
            transition: 'height 0.15s ease',
            animation: active ? `wave ${0.4 + i * 0.1}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  )
}

// ---- Animated Mic Button ----
export function MicButton({ isRecording, onToggle, disabled }) {
  return (
    <button
      className={`btn ${isRecording ? 'btn-danger animate-glow' : 'btn-secondary'}`}
      onClick={onToggle}
      disabled={disabled}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {isRecording && (
        <span style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '2px solid var(--accent-rose)',
          animation: 'pulse 1s ease infinite',
        }} />
      )}
      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  )
}

// ---- Score Ring ----
export function ScoreRing({ score, size = 120, strokeWidth = 8, label = 'Score' }) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 85 ? 'var(--accent-emerald)' :
    score >= 70 ? 'var(--accent-cyan)' :
    score >= 50 ? 'var(--accent-amber)' :
    'var(--accent-rose)'

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-track"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-fill"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: size / 5, fontWeight: 800, color }}>{score}</span>
        <span style={{ fontSize: size / 10, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      </div>
    </div>
  )
}

// ---- Typing Text Animated ----
export function TypingText({ text, speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(interval)
        setDone(true)
        onDone?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!done && (
        <span style={{
          display: 'inline-block',
          width: 2,
          height: '1em',
          background: 'var(--accent-primary)',
          marginLeft: 2,
          verticalAlign: 'text-bottom',
          animation: 'blink 0.8s ease infinite',
        }} />
      )}
    </span>
  )
}

// ---- Stat Card ----
export function StatCard({ label, value, icon: Icon, color = 'var(--accent-primary)', trend }) {
  return (
    <div className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color }}>{value}</p>
          {trend && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{trend}</p>}
        </div>
        {Icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-sm)',
            background: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={color} />
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Loading Spinner ----
export function Spinner({ size = 24, color = 'var(--accent-primary)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid transparent`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

// ---- Toast Notification ----
export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    info: 'var(--accent-cyan)',
    success: 'var(--accent-emerald)',
    error: 'var(--accent-rose)',
    warning: 'var(--accent-amber)',
  }

  return (
    <div className="animate-slide-in" style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 20px',
      background: 'var(--bg-secondary)',
      border: `1px solid ${colors[type]}40`,
      borderRadius: 'var(--radius-md)',
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${colors[type]}20`,
      maxWidth: 360,
    }}>
      <div style={{ width: 4, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0, background: colors[type], borderRadius: '4px 0 0 4px' }} />
      <span style={{ fontSize: 14, color: 'var(--text-primary)', paddingLeft: 8 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  )
}

// ---- Difficulty Badge ----
export function DifficultyBadge({ level }) {
  const map = {
    1: { label: 'Easy', color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.15)' },
    2: { label: 'Medium', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.15)' },
    3: { label: 'Hard', color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.15)' },
  }
  const d = map[level] || map[2]
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      background: d.bg, color: d.color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
    }}>
      {d.label}
    </span>
  )
}
