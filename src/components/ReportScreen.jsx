import React, { useEffect, useRef } from 'react'
import { Download, RefreshCw, CheckCircle, TrendingUp, AlertTriangle, Star, Award, Zap, ChevronRight, Share2, Printer } from 'lucide-react'
import { useInterview } from '../context/InterviewContext'
import { ScoreRing } from './UI'
import { motion } from 'framer-motion'
import { marked } from 'marked'

export default function ReportScreen() {
  const { state, dispatch } = useInterview()
  const reportRef = useRef(null)

  if (!state.report) return null

  const report = state.report
  const avgScore = Math.round(state.evaluations.reduce((a, e) => a + e.score, 0) / state.evaluations.length) || 0
  const hiringProbability = report.hiringProbability || 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  const handleDownload = () => {
    const text = `
INTERVIEW PERFORMANCE REPORT
============================
Candidate: ${state.resumeData?.name || 'Candidate'}
Role/Topic: ${state.selectedTopic}
Overall Score: ${avgScore}%
Hiring Probability: ${hiringProbability}%

SUMMARY:
${report.summary}

STRENGTHS:
${report.strengths?.map(s => `- ${s}`).join('\n')}

IMPROVEMENT AREAS:
${report.improvementAreas?.map(i => `- ${i}`).join('\n')}

DETAILED EVALUATION:
${state.evaluations.map((e, i) => `
Q${i + 1}: ${state.questions[i]}
Score: ${e.score}%
Feedback: ${e.feedback}
`).join('\n')}
    `
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Interview_Report_${state.resumeData?.name || 'User'}.txt`
    a.click()
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }} ref={reportRef}>
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60 }}
      >
        <div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', 
              background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, color: 'var(--accent-emerald)',
              fontSize: 12, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase'
            }}
          >
            <CheckCircle size={14} /> Session Completed Successfully
          </motion.div>
          <h1 className="heading-hero" style={{ fontSize: '3.5rem', lineHeight: 1 }}>Performance Insight</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginTop: 12 }}>
            Evaluation for <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{state.resumeData?.name || 'Anonymous Candidate'}</span> · {state.selectedTopic}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={handleDownload} style={{ border: '1px solid var(--glass-border)' }}>
            <Download size={18} /> Download TXT
          </button>
          <button className="btn btn-ghost" onClick={() => window.print()} style={{ border: '1px solid var(--glass-border)' }}>
            <Printer size={18} /> Print
          </button>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'RESET' })}>
            <RefreshCw size={18} /> New Session
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32 }}
      >
        {/* Main Stats Card */}
        <motion.div variants={cardVariants} className="glass glow-primary" style={{ gridColumn: 'span 8', padding: 40, display: 'flex', gap: 48, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <ScoreRing score={avgScore} size={180} strokeWidth={12} fontSize={40} />
            <span style={{ display: 'block', marginTop: 16, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Rating</span>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 800 }}>Summary Overview</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={18} fill={s <= Math.round(avgScore/20) ? "var(--accent-amber)" : "none"} color={s <= Math.round(avgScore/20) ? "var(--accent-amber)" : "rgba(255,255,255,0.1)"} />)}
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 16 }}>
              {report.summary}
            </p>
            <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Questions Asked</span>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{state.questions.length}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Total Time</span>
                <span style={{ fontSize: 20, fontWeight: 800 }}>~{state.questions.length * 2}m</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Difficulty</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-secondary)' }}>{state.difficulty}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Probability Card */}
        <motion.div variants={cardVariants} className="glass" style={{ gridColumn: 'span 4', padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <TrendingUp size={48} color="var(--accent-cyan)" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Hiring Probability</h3>
          <div style={{ fontSize: 64, fontWeight: 900, fontFamily: 'var(--font-mono)', lineHeight: 1, color: 'var(--accent-cyan)' }}>
            {hiringProbability}%
          </div>
          <p style={{ marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
            Based on current technical depth and communication clarity.
          </p>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginTop: 24, overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${hiringProbability}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{ height: '100%', background: 'var(--accent-cyan)', boxShadow: '0 0 15px var(--accent-cyan)' }}
            />
          </div>
        </motion.div>

        {/* Strengths */}
        <motion.div variants={cardVariants} className="glass" style={{ gridColumn: 'span 6', padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Award size={24} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Key Strengths</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.strengths?.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle size={18} color="var(--accent-emerald)" style={{ marginTop: 2 }} />
                <span style={{ fontSize: 15, fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Improvements */}
        <motion.div variants={cardVariants} className="glass" style={{ gridColumn: 'span 6', padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <AlertTriangle size={24} color="var(--accent-rose)" />
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Improvement Areas</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.improvementAreas?.map((im, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(244, 63, 94, 0.05)', borderRadius: 12, border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                <Target size={18} color="var(--accent-rose)" style={{ marginTop: 2 }} />
                <span style={{ fontSize: 15, fontWeight: 500 }}>{im}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Timeline */}
        <motion.div variants={cardVariants} className="glass" style={{ gridColumn: 'span 12', padding: 40 }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 40 }}>Atomic Response Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {state.evaluations.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, zIndex: 1 }}>
                    {i + 1}
                  </div>
                  {i < state.evaluations.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 700, maxWidth: '80%' }}>{state.questions[i]}</h4>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: ev.score >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{ev.score}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </div>
                  <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MessageSquare size={14} /> CANDIDATE RESPONSE
                    </div>
                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: 20, fontSize: 15 }}>"{state.answers[i].answer}"</p>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 20 }} />
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={14} color="var(--accent-amber)" /> AI FEEDBACK & OPTIMAL SOLUTION
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                      {ev.feedback}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
