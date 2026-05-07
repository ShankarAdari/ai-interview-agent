import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, Brain, Sparkles, Zap, Target, Shield } from 'lucide-react'
import { useInterview } from '../context/InterviewContext'
import { analyzeResume } from '../services/gemini'
import { Spinner } from './UI'
import { motion, AnimatePresence } from 'framer-motion'
import * as pdfjs from 'pdfjs-dist'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const TOPICS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
  'Data Structures & Algorithms', 'System Design', 'Machine Learning',
  'SQL & Databases', 'DevOps & CI/CD', 'Cloud (AWS/GCP/Azure)',
  'Java', 'C++', 'Cybersecurity', 'Blockchain',
  'Product Management', 'Leadership & Management', 'Communication Skills',
  'Problem Solving', 'Full Stack Development'
]

const MODES = [
  { id: 'technical',  emoji: '⚙️', label: 'Technical',  desc: 'Code & systems'  },
  { id: 'behavioral', emoji: '🤝', label: 'Behavioral', desc: 'STAR method'      },
  { id: 'mixed',      emoji: '🎯', label: 'Mixed',      desc: 'Best of both'    },
]

const LEVELS = ['Junior', 'Mid-Level', 'Senior']

export default function SetupScreen() {
  const { state, dispatch } = useInterview()
  const [parsing, setParsing] = useState(false)
  const [resumeParsed, setResumeParsed] = useState(false)
  const [error, setError] = useState('')
  const [manualResume, setManualResume] = useState('')
  const [inputMode, setInputMode] = useState('upload')

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      fullText += content.items.map(item => item.str).join(' ') + '\n'
    }
    return fullText
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setParsing(true)
    setError('')
    try {
      const text = file.type === 'application/pdf'
        ? await extractTextFromPDF(file)
        : await file.text()

      dispatch({ type: 'SET_RESUME_TEXT', payload: text })
      const parsed = await analyzeResume(text)
      dispatch({ type: 'SET_RESUME_DATA', payload: parsed })

      // Auto-select first suggested topic from resume
      if (parsed.interviewTopics?.[0]) {
        dispatch({ type: 'SET_TOPIC', payload: parsed.interviewTopics[0] })
      }
      setResumeParsed(true)
    } catch (e) {
      console.error(e)
      setError('Could not parse resume. Try pasting text instead.')
    } finally {
      setParsing(false)
    }
  }, [dispatch])

  const handlePasteAnalyze = async () => {
    if (!manualResume.trim()) return
    setParsing(true)
    setError('')
    try {
      dispatch({ type: 'SET_RESUME_TEXT', payload: manualResume })
      const parsed = await analyzeResume(manualResume)
      dispatch({ type: 'SET_RESUME_DATA', payload: parsed })
      if (parsed.interviewTopics?.[0]) {
        dispatch({ type: 'SET_TOPIC', payload: parsed.interviewTopics[0] })
      }
      setResumeParsed(true)
    } catch (e) {
      setError('Failed to analyze text. Please try again.')
    } finally {
      setParsing(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    multiple: false
  })

  const intensityLabel = state.difficulty === 'Senior' ? 'HARD' : state.difficulty === 'Mid-Level' ? 'MEDIUM' : 'EASY'
  const intensityColor = state.difficulty === 'Senior' ? 'var(--accent-rose)' : state.difficulty === 'Mid-Level' ? 'var(--accent-amber)' : 'var(--accent-emerald)'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <h1 className="heading-hero text-gradient" style={{ fontSize: '3.5rem', marginBottom: 12 }}>
          Configure Your Session
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Tailor the AI's behavior to match your career goals and technical expertise.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32 }}>

        {/* ─── Step 1: Career Context ─── */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass glow-primary"
          style={{ padding: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="var(--accent-secondary)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>1. Career Context</h3>
          </div>

          {/* Upload / Paste toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['upload', 'paste'].map(mode => (
              <button
                key={mode}
                className={`btn btn-sm ${inputMode === mode ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setInputMode(mode)}
                style={{ flex: 1, textTransform: 'capitalize' }}
              >
                {mode === 'upload' ? '📄 Upload' : '✏️ Paste'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {inputMode === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center', cursor: 'pointer',
                  background: isDragActive ? 'rgba(108,99,255,0.05)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <input {...getInputProps()} />
                {parsing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <Spinner size={32} />
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Parsing & Analyzing Resume...</span>
                  </div>
                ) : resumeParsed ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={32} color="var(--accent-emerald)" />
                    <span style={{ fontSize: 15, color: 'var(--accent-emerald)', fontWeight: 700 }}>Resume Analyzed!</span>
                    {state.resumeData?.name && (
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        👤 {state.resumeData.name}
                        {state.resumeData.yearsOfExperience ? ` · ${state.resumeData.yearsOfExperience}yr exp` : ''}
                      </span>
                    )}
                    {state.resumeData?.topTechnologies?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                        {state.resumeData.topTechnologies.slice(0, 4).map(t => (
                          <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={e => { e.stopPropagation(); setResumeParsed(false) }}>
                      Change File
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Upload size={24} color="var(--text-muted)" />
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>Drop Resume (PDF / TXT)</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>or click to browse · Max 5MB</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                      Optional — skip to configure manually below
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="paste"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <textarea
                  className="textarea"
                  placeholder="Paste your resume, LinkedIn summary, or professional bio here..."
                  value={manualResume}
                  onChange={e => setManualResume(e.target.value)}
                  style={{ height: 160, fontSize: 14 }}
                />
                {resumeParsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, color: 'var(--accent-emerald)', fontSize: 13, fontWeight: 600 }}>
                    <CheckCircle size={16} /> Context analyzed successfully
                  </div>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 12, width: '100%' }}
                  onClick={handlePasteAnalyze}
                  disabled={!manualResume.trim() || parsing}
                >
                  {parsing ? <Spinner size={16} /> : <><Sparkles size={14} /> Analyze Context</>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p style={{ color: 'var(--accent-rose)', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </motion.div>

        {/* ─── Step 2: Interview Scope ─── */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass glow-primary"
          style={{ padding: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,211,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>2. Interview Scope</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Primary Domain */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Primary Domain</label>
              <select
                className="select"
                value={state.selectedTopic}
                onChange={e => dispatch({ type: 'SET_TOPIC', payload: e.target.value })}
              >
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Interview Mode */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Interview Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {MODES.map(m => {
                  const active = state.interviewMode === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => dispatch({ type: 'SET_MODE', payload: m.id })}
                      style={{
                        padding: '10px 6px', borderRadius: 'var(--radius-md)', border: 'none',
                        background: active ? 'rgba(108,99,255,0.18)' : 'rgba(255,255,255,0.03)',
                        outline: active ? '1px solid rgba(108,99,255,0.45)' : '1px solid rgba(255,255,255,0.07)',
                        color: active ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 3 }}>{m.emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Interview Depth */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Interview Depth</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    className={`btn btn-sm ${state.difficulty === lvl ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: lvl })}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Length */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Session Length</label>
              <input
                type="range"
                min="3" max="15"
                value={state.questionCount}
                onChange={e => dispatch({ type: 'SET_QUESTION_COUNT', payload: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quick Check</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)' }}>{state.questionCount} Questions</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deep Dive</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Launch Card ─── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="glass"
          style={{
            padding: 32, gridColumn: '1 / -1',
            background: 'var(--gradient-card)', border: '1px solid rgba(108,99,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24
          }}
        >
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {[
              { label: 'MODE',      value: state.interviewMode?.toUpperCase() || 'TECHNICAL', color: 'var(--accent-primary)' },
              { label: 'INTENSITY', value: intensityLabel, color: intensityColor },
              { label: 'EST. TIME', value: `${state.questionCount * 3} MIN`, color: 'var(--text-primary)' },
              { label: 'QUESTIONS', value: state.questionCount, color: 'var(--accent-cyan)' },
              { label: 'PLATFORM',  value: 'VIRTUAL', color: 'var(--text-primary)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color }}>{value}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ padding: '16px 48px', fontSize: 18 }}
            onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'interview' })}
          >
            Launch Interview Session <Zap size={20} style={{ marginLeft: 8 }} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
