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
      const strings = content.items.map(item => item.str)
      fullText += strings.join(' ') + '\n'
    }
    return fullText
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setParsing(true)
    setError('')
    try {
      let text = ''
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file)
      } else {
        text = await file.text()
      }
      
      dispatch({ type: 'SET_RESUME_TEXT', payload: text })
      const parsed = await analyzeResume(text)
      dispatch({ type: 'SET_RESUME_DATA', payload: parsed })
      
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    multiple: false
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
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
        {/* Step 1: Context */}
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

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button
              className={`btn btn-sm ${inputMode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setInputMode('upload')}
              style={{ flex: 1 }}
            >
              Upload
            </button>
            <button
              className={`btn btn-sm ${inputMode === 'paste' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setInputMode('paste')}
              style={{ flex: 1 }}
            >
              Paste
            </button>
          </div>

          <AnimatePresence mode="wait">
            {inputMode === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
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
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Analyzing Resume...</span>
                  </div>
                ) : resumeParsed ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={32} color="var(--accent-emerald)" />
                    <span style={{ fontSize: 14, color: 'var(--accent-emerald)', fontWeight: 600 }}>Resume Analyzed!</span>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{state.resumeData?.name}</p>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setResumeParsed(false); }}>Change File</button>
                  </div>
                ) : (
                  <>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Upload size={24} color="var(--text-muted)" />
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop Resume (PDF/TXT)</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Max size 5MB</p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="paste"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <textarea
                  className="textarea"
                  placeholder="Paste your resume or professional bio here..."
                  value={manualResume}
                  onChange={(e) => setManualResume(e.target.value)}
                  style={{ height: 160, fontSize: 14 }}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 12, width: '100%' }}
                  onClick={async () => {
                    setParsing(true)
                    const parsed = await analyzeResume(manualResume)
                    dispatch({ type: 'SET_RESUME_DATA', payload: parsed })
                    setResumeParsed(true)
                    setParsing(false)
                  }}
                  disabled={!manualResume || parsing}
                >
                  {parsing ? <Spinner size={16} /> : <><Sparkles size={14} /> Process Context</>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {error && <p style={{ color: 'var(--accent-rose)', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </motion.div>

        {/* Step 2: Settings */}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Interview Depth</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {['Junior', 'Mid-Level', 'Senior'].map(lvl => (
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

        {/* Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass"
          style={{
            padding: 32, gridColumn: '1 / -1', marginTop: 16,
            background: 'var(--gradient-card)', border: '1px solid rgba(108, 99, 255, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24
          }}
        >
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>INTENSITY</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-rose)' }}>
                {state.difficulty === 'Senior' ? 'HARD' : state.difficulty === 'Mid-Level' ? 'MEDIUM' : 'EASY'}
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>EST. TIME</span>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{state.questionCount * 3} MIN</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>PLATFORM</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-cyan)' }}>VIRTUAL</span>
            </div>
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
