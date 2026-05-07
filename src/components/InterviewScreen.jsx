import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send, SkipForward, Clock, ChevronRight, Brain,
  Mic, MicOff, Volume2, AlertCircle, CheckCircle2, X
} from 'lucide-react'
import { useInterview } from '../context/InterviewContext'
import { generateInterviewQuestion, evaluateAnswer, generateFinalReport, resetConversation } from '../services/gemini'
import { TypingText, Spinner, DifficultyBadge, MicButton, VoiceWave } from './UI'

function QuestionSidebar({ questions, evaluations, currentIdx }) {
  return (
    <div className="glass" style={{
      width: 240, flexShrink: 0, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 8,
      overflowY: 'auto', maxHeight: 'calc(100vh - 120px)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        Questions
      </p>
      {questions.map((q, i) => {
        const ev = evaluations[i]
        const isCurrent = i === currentIdx
        const isDone = i < currentIdx
        return (
          <div
            key={i}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: isCurrent ? 'rgba(108,99,255,0.15)' : isDone ? 'rgba(16,185,129,0.08)' : 'var(--glass-bg)',
              border: `1px solid ${isCurrent ? 'rgba(108,99,255,0.4)' : isDone ? 'rgba(16,185,129,0.2)' : 'var(--glass-border)'}`,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: isCurrent ? 'var(--accent-secondary)' : isDone ? 'var(--accent-emerald)' : 'var(--text-muted)',
              }}>
                Q{i + 1}
              </span>
              {isDone && ev && (
                <span style={{ fontSize: 11, fontWeight: 700, color: ev.score >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                  {ev.score}
                </span>
              )}
              {isCurrent && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulse 1.5s ease infinite' }} />}
            </div>
            <p style={{
              fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {q.slice(0, 60)}...
            </p>
          </div>
        )
      })}
    </div>
  )
}

function EvaluationPanel({ evaluation, onNext, isLast }) {
  const scoreColor = evaluation.score >= 85 ? 'var(--accent-emerald)' :
    evaluation.score >= 70 ? 'var(--accent-cyan)' :
    evaluation.score >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)'

  return (
    <div className="glass animate-fade-in" style={{ padding: 24, marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: scoreColor }}>{evaluation.score}</span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/100</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{evaluation.feedback}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onNext}>
          {isLast ? 'See Report' : 'Next Question'} <ChevronRight size={15} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Technical', val: evaluation.technicalAccuracy },
          { label: 'Clarity', val: evaluation.communicationClarity },
          { label: 'Completeness', val: evaluation.completeness },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: m.val >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{m.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {evaluation.strengths?.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ Strengths</p>
            {evaluation.strengths.map((s, i) => (
              <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>• {s}</p>
            ))}
          </div>
        )}
        {evaluation.improvements?.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-amber)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>↑ Improve</p>
            {evaluation.improvements.map((s, i) => (
              <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>• {s}</p>
            ))}
          </div>
        )}
      </div>

      {evaluation.idealAnswer && (
        <div style={{
          marginTop: 16, padding: '12px 16px',
          background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ideal Answer Outline</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{evaluation.idealAnswer}</p>
        </div>
      )}
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'

export default function InterviewScreen() {
  const { state, dispatch } = useInterview()
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [currentEvaluation, setCurrentEvaluation] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [timerActive, setTimerActive] = useState(false)
  const [questionReady, setQuestionReady] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  const qNum = state.currentQuestionIndex + 1
  const totalQ = state.questionCount
  const isLastQuestion = qNum >= totalQ
  const progress = (state.currentQuestionIndex / totalQ) * 100

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft(prev => {
      if (prev <= 1) { clearInterval(t); return 0 }
      return prev - 1
    }), 1000)
    return () => clearInterval(t)
  }, [timerActive, timeLeft])

  // Load first question on mount
  useEffect(() => {
    resetConversation()
    loadNextQuestion()
  }, [])

  const loadNextQuestion = useCallback(async () => {
    setLoadingQuestion(true)
    setCurrentEvaluation(null)
    setUserAnswer('')
    setIsTyping(false)
    setQuestionReady(false)
    setTimeLeft(120)
    setError('')

    try {
      const q = await generateInterviewQuestion({
        resumeData: state.resumeData,
        topic: state.selectedTopic,
        difficulty: state.difficulty,
        questionNumber: state.currentQuestionIndex + 1,
        previousQuestions: state.questions,
      })
      dispatch({ type: 'ADD_QUESTION', payload: q })
      setCurrentQuestion(q)
      setIsTyping(true)
    } catch (e) {
      setError('Failed to generate question. Check your API key.')
    } finally {
      setLoadingQuestion(false)
    }
  }, [state, dispatch])

  const handleTypingDone = () => {
    setIsTyping(false)
    setQuestionReady(true)
    setTimerActive(true)
    textareaRef.current?.focus()
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isEvaluating) return
    setTimerActive(false)
    setIsEvaluating(true)
    setError('')

    try {
      const ev = await evaluateAnswer({
        question: currentQuestion,
        answer: userAnswer,
        topic: state.selectedTopic,
        difficulty: state.difficulty,
      })
      dispatch({ type: 'ADD_ANSWER', payload: { question: currentQuestion, answer: userAnswer } })
      dispatch({ type: 'ADD_EVALUATION', payload: ev })
      setCurrentEvaluation(ev)
    } catch (e) {
      setError('Evaluation failed. Please try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleNext = async () => {
    if (isLastQuestion) {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const scores = state.evaluations.map(e => e.score)
        const report = await generateFinalReport({
          resumeData: state.resumeData,
          topic: state.selectedTopic,
          answers: state.answers,
          scores,
        })
        dispatch({ type: 'SET_REPORT', payload: report })
        dispatch({ type: 'SET_SCREEN', payload: 'report' })
      } catch (e) {
        setError('Failed to generate report.')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
      await loadNextQuestion()
    }
  }

  const toggleRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Voice input not supported in this browser.')
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setUserAnswer(transcript)
    }
    rec.onerror = () => setIsRecording(false)
    rec.onend = () => setIsRecording(false)
    recognitionRef.current = rec
    rec.start()
    setIsRecording(true)
  }, [isRecording])

  const timerColor = timeLeft > 60 ? 'var(--accent-emerald)' : timeLeft > 30 ? 'var(--accent-amber)' : 'var(--accent-rose)'
  const avgScore = state.evaluations.length
    ? Math.round(state.evaluations.reduce((a, e) => a + e.score, 0) / state.evaluations.length)
    : null

  if (state.isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 20 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
          style={{ position: 'relative' }}
        >
          <Spinner size={80} color="var(--accent-primary)" />
          <Brain size={32} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--accent-primary)' }} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: 'var(--text-secondary)', fontSize: 18, fontWeight: 500 }}
        >
          Generating your personalized report...
        </motion.p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
          flexShrink: 0, zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Brain size={20} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>{state.selectedTopic}</span>
          <DifficultyBadge level={state.difficulty} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {avgScore !== null && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>AVG SCORE</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: avgScore >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{avgScore}</span>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>PROGRESS</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{qNum}<span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/{totalQ}</span></span>
          </div>
          <AnimatePresence>
            {questionReady && !currentEvaluation && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Clock size={15} color={timerColor} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: timerColor }}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--glass-border)', flexShrink: 0 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress + (1 / totalQ) * 100}%` }}
          style={{
            height: '100%',
            background: 'var(--gradient-primary)',
            borderRadius: 2,
            boxShadow: '0 0 10px rgba(108, 99, 255, 0.5)',
          }}
        />
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>
        {/* Sidebar */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={{ padding: '16px 0 16px 16px', overflowY: 'auto' }}
        >
          <QuestionSidebar
            questions={state.questions}
            evaluations={state.evaluations}
            currentIdx={state.currentQuestionIndex}
          />
        </motion.div>

        {/* Interview Area */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Question Card */}
          <motion.div
            layout
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass"
            style={{ padding: 32, background: 'var(--gradient-card)', border: '1px solid rgba(108, 99, 255, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={20} color="var(--accent-secondary)" />
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
                    AI Interviewer
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Question {qNum} of {totalQ}</span>
                </div>
              </div>
              
              {/* AI Mood/Sentiment Indicator */}
              {currentEvaluation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', background: 'rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Mood</span>
                  {currentEvaluation.sentiment === 'positive' && <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                    <span style={{ fontSize: 11, color: 'var(--accent-emerald)', fontWeight: 700 }}>Impressive</span>
                  </div>}
                  {currentEvaluation.sentiment === 'neutral' && <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 700 }}>Listening</span>
                  </div>}
                  {currentEvaluation.sentiment === 'negative' && <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-rose)' }} />
                    <span style={{ fontSize: 11, color: 'var(--accent-rose)', fontWeight: 700 }}>Critical</span>
                  </div>}
                </motion.div>
              )}
            </div>

            <div style={{ fontSize: 20, lineHeight: 1.8, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', minHeight: 80 }}>
              {loadingQuestion ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <Spinner size={24} />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 16 }}
                  >
                    Formulating a challenging question...
                  </motion.span>
                </div>
              ) : isTyping ? (
                <TypingText text={currentQuestion} speed={25} onDone={handleTypingDone} />
              ) : (
                currentQuestion
              )}
            </div>
          </motion.div>

          {/* Answer Area */}
          <AnimatePresence mode="wait">
            {questionReady && !currentEvaluation && (
              <motion.div
                key="answer-input"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Response Interface
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {isRecording && <VoiceWave active={isRecording} />}
                    <MicButton isRecording={isRecording} onToggle={toggleRecording} disabled={isEvaluating} />
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  className="textarea"
                  placeholder="Articulate your response here..."
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  disabled={isEvaluating}
                  style={{
                    minHeight: 220, fontSize: 16, lineHeight: 1.8,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitAnswer()
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {userAnswer.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Ctrl+Enter to submit
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      className="btn btn-secondary"
                      onClick={handleNext}
                      title="Skip this question"
                    >
                      <SkipForward size={16} /> Skip
                    </button>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isEvaluating}
                      style={{ padding: '12px 32px' }}
                    >
                      {isEvaluating ? (
                        <><Spinner size={18} /> Analyzing...</>
                      ) : (
                        <><Send size={18} /> Submit Response</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Evaluation Result */}
            {currentEvaluation && (
              <motion.div
                key="evaluation-panel"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <EvaluationPanel
                  evaluation={currentEvaluation}
                  onNext={handleNext}
                  isLast={isLastQuestion}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <AlertCircle size={18} color="var(--accent-rose)" />
              <span style={{ fontSize: 14, color: 'var(--accent-rose)', fontWeight: 500 }}>{error}</span>
              <button className="btn btn-ghost btn-sm" onClick={loadNextQuestion} style={{ marginLeft: 'auto' }}>Retry</button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
