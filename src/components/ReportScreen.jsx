import React, { useEffect, useRef, useState } from 'react'
import {
  Download, RefreshCw, CheckCircle, TrendingUp, AlertTriangle,
  Star, Award, Zap, Printer, BookOpen, Target, MessageSquare,
  ChevronUp, ChevronDown, History, BarChart2
} from 'lucide-react'
import { useInterview } from '../context/InterviewContext'
import { ScoreRing } from './UI'
import { motion, AnimatePresence } from 'framer-motion'

// --- Mini Radar/Bar Chart for multi-dimensional scores ---
function SkillBar({ label, score, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 3, boxShadow: `0 0 10px ${color}66` }}
        />
      </div>
    </div>
  )
}

// --- Collapsible Q&A breakdown item ---
function BreakdownItem({ question, answer, evaluation, index }) {
  const [expanded, setExpanded] = useState(false)
  const scoreColor = evaluation.score >= 80 ? 'var(--accent-emerald)'
    : evaluation.score >= 60 ? 'var(--accent-cyan)'
    : evaluation.score >= 40 ? 'var(--accent-amber)'
    : 'var(--accent-rose)'

  return (
    <motion.div
      layout
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)'
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 16,
          padding: '16px 20px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `${scoreColor}22`, border: `1px solid ${scoreColor}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: scoreColor
        }}>
          {index + 1}
        </div>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          {question}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor }}>
            {evaluation.score}<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/100</span>
          </span>
          {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </button>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ paddingTop: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <MessageSquare size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Answer</span>
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                  "{answer?.answer || 'No response recorded.'}"
                </p>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Zap size={13} color="var(--accent-amber)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>AI Feedback & Optimal Solution</span>
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.8 }}>{evaluation.feedback}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// --- Verdict badge ---
function VerdictBadge({ verdict }) {
  const map = {
    'Strongly Recommended': { color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
    'Recommended': { color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.3)' },
    'Consider': { color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    'Not Recommended': { color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)' },
  }
  const style = map[verdict] || map['Consider']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 'var(--radius-full)',
      background: style.bg, border: `1px solid ${style.border}`,
      color: style.color, fontSize: 13, fontWeight: 700
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: style.color }} />
      {verdict}
    </span>
  )
}

export default function ReportScreen() {
  const { state, dispatch } = useInterview()

  useEffect(() => {
    if (!state.report) return
    // Persist this session to localStorage history
    try {
      const history = JSON.parse(localStorage.getItem('interview_history') || '[]')
      const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        topic: state.selectedTopic,
        role: state.selectedRole,
        difficulty: state.difficulty,
        score: Math.round(state.evaluations.reduce((a, e) => a + e.score, 0) / state.evaluations.length) || 0,
        hiringProbability: state.report.hiringProbability || 0,
        verdict: state.report.verdict,
        grade: state.report.grade,
      }
      history.unshift(session)
      // Keep only last 10 sessions
      localStorage.setItem('interview_history', JSON.stringify(history.slice(0, 10)))
    } catch (_) { /* silent */ }
  }, [state.report])

  if (!state.report) return null

  const report = state.report
  const avgScore = Math.round(state.evaluations.reduce((a, e) => a + e.score, 0) / state.evaluations.length) || 0
  const hiringProbability = report.hiringProbability || 0

  const handleDownload = () => {
    const text = `
INTERVIEW PERFORMANCE REPORT
=============================
Candidate : ${state.resumeData?.name || 'Candidate'}
Role/Topic : ${state.selectedTopic}
Difficulty : ${state.difficulty}
Date       : ${new Date().toLocaleDateString()}

OVERALL SCORE     : ${avgScore}%
HIRING PROBABILITY: ${hiringProbability}%
VERDICT           : ${report.verdict || 'N/A'}
GRADE             : ${report.grade || 'N/A'}

SUMMARY:
${report.summary}

STRENGTHS:
${report.strengths?.map(s => `  • ${s}`).join('\n') || 'N/A'}

IMPROVEMENT AREAS:
${report.improvementAreas?.map(i => `  • ${i}`).join('\n') || 'N/A'}

NEXT STEPS:
${report.nextSteps?.map(s => `  → ${s}`).join('\n') || 'N/A'}

DETAILED EVALUATION:
${state.evaluations.map((e, i) => `
  Q${i + 1}: ${state.questions[i]}
  Score   : ${e.score}/100
  Feedback: ${e.feedback}
`).join('\n')}
    `
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `InterviewReport_${state.resumeData?.name || 'User'}_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }
  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  }

  const skillDimensions = [
    { label: 'Technical Depth', score: report.technicalScore || avgScore, color: 'var(--accent-primary)' },
    { label: 'Communication', score: report.communicationScore || avgScore, color: 'var(--accent-cyan)' },
    { label: 'Problem Solving', score: report.problemSolvingScore || avgScore, color: 'var(--accent-secondary)' },
    { label: 'Confidence', score: report.confidenceScore || avgScore, color: 'var(--accent-emerald)' },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 120px' }}>

      {/* ─── Header ─── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}
      >
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px',
            background: 'rgba(16,185,129,0.1)', borderRadius: 8, color: 'var(--accent-emerald)',
            fontSize: 11, fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em'
          }}>
            <CheckCircle size={13} /> Session Completed
          </div>
          <h1 className="heading-hero" style={{ fontSize: '3rem', lineHeight: 1 }}>
            Performance <span className="text-gradient">Insight</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 12 }}>
            Evaluation for{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {state.resumeData?.name || 'Anonymous'}
            </span>
            {' '}·{' '}{state.selectedTopic}
            {' '}·{' '}{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={handleDownload} style={{ border: '1px solid var(--glass-border)' }}>
            <Download size={16} /> Export TXT
          </button>
          <button className="btn btn-ghost" onClick={() => window.print()} style={{ border: '1px solid var(--glass-border)' }}>
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'FULL_RESET' })}>
            <RefreshCw size={16} /> New Session
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}
      >

        {/* ─── Hero Score Card ─── */}
        <motion.div variants={itemVariants} className="glass glow-primary"
          style={{ gridColumn: 'span 8', padding: 36, display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <ScoreRing score={avgScore} size={160} strokeWidth={10} fontSize={36} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={16}
                  fill={s <= Math.round(avgScore / 20) ? 'var(--accent-amber)' : 'none'}
                  color={s <= Math.round(avgScore / 20) ? 'var(--accent-amber)' : 'rgba(255,255,255,0.1)'} />
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginTop: 6, textTransform: 'uppercase' }}>
              Overall Rating
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>Summary Overview</span>
              {report.grade && (
                <span style={{
                  fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)',
                  background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{report.grade}</span>
              )}
            </div>
            {report.verdict && <div style={{ marginBottom: 16 }}><VerdictBadge verdict={report.verdict} /></div>}
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15 }}>
              {report.summary}
            </p>
            <div style={{ display: 'flex', gap: 28, marginTop: 28 }}>
              {[
                { label: 'Questions', value: state.questions.length },
                { label: 'Duration', value: `~${state.questions.length * 2}m` },
                { label: 'Difficulty', value: state.difficulty, color: 'var(--accent-secondary)' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>{label}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: color || 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Hiring Probability ─── */}
        <motion.div variants={itemVariants} className="glass"
          style={{ gridColumn: 'span 4', padding: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={40} color="var(--accent-cyan)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Hiring Probability
          </h3>
          <div style={{ fontSize: 64, fontWeight: 900, fontFamily: 'var(--font-mono)', lineHeight: 1, color: 'var(--accent-cyan)' }}>
            {hiringProbability}%
          </div>
          <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
            Based on technical depth, communication clarity, and response confidence.
          </p>
          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginTop: 20, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hiringProbability}%` }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              style={{ height: '100%', background: 'var(--accent-cyan)', boxShadow: '0 0 12px var(--accent-cyan)' }}
            />
          </div>
        </motion.div>

        {/* ─── Skill Dimensions ─── */}
        <motion.div variants={itemVariants} className="glass"
          style={{ gridColumn: 'span 6', padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <BarChart2 size={22} color="var(--accent-primary)" />
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Skill Dimensions</h3>
          </div>
          {skillDimensions.map(dim => (
            <SkillBar key={dim.label} {...dim} />
          ))}
        </motion.div>

        {/* ─── Strengths ─── */}
        <motion.div variants={itemVariants} className="glass"
          style={{ gridColumn: 'span 6', padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Award size={22} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Key Strengths</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(report.strengths || []).map((s, i) => (
              <motion.div
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 16px',
                  background: 'rgba(16,185,129,0.05)',
                  borderRadius: 12, border: '1px solid rgba(16,185,129,0.12)'
                }}
              >
                <CheckCircle size={16} color="var(--accent-emerald)" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{s}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Improvement Areas ─── */}
        <motion.div variants={itemVariants} className="glass"
          style={{ gridColumn: 'span 6', padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <AlertTriangle size={22} color="var(--accent-rose)" />
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Improvement Areas</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(report.improvementAreas || []).map((im, i) => (
              <motion.div
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 16px',
                  background: 'rgba(244,63,94,0.05)',
                  borderRadius: 12, border: '1px solid rgba(244,63,94,0.12)'
                }}
              >
                <Target size={16} color="var(--accent-rose)" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{im}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Next Steps / Learning Resources ─── */}
        {(report.nextSteps?.length > 0 || report.learningResources?.length > 0) && (
          <motion.div variants={itemVariants} className="glass"
            style={{ gridColumn: 'span 6', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <BookOpen size={22} color="var(--accent-amber)" />
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Next Steps</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(report.nextSteps || []).map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 14px',
                  background: 'rgba(245,158,11,0.05)',
                  borderRadius: 10, border: '1px solid rgba(245,158,11,0.12)'
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-amber)', minWidth: 20, marginTop: 1 }}>
                    {i + 1}.
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Detailed Q&A Breakdown ─── */}
        <motion.div variants={itemVariants} className="glass"
          style={{ gridColumn: 'span 12', padding: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <Zap size={22} color="var(--accent-primary)" />
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>Atomic Response Breakdown</h3>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Click any question to expand
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {state.evaluations.map((ev, i) => (
              <BreakdownItem
                key={i}
                index={i}
                question={state.questions[i]}
                answer={state.answers[i]}
                evaluation={ev}
              />
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
