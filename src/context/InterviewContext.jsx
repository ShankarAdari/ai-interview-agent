import React, { createContext, useContext, useReducer } from 'react'

const InterviewContext = createContext(null)

const initialState = {
  // App state
  screen: 'home', // home | setup | interview | report
  apiKey: (() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored !== null) return stored;
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  })(),

  // Setup
  resumeData: null,
  resumeText: '',
  selectedTopic: 'JavaScript',
  selectedRole: '',
  difficulty: 'Mid-Level',
  questionCount: 7,
  interviewMode: 'technical', // technical | behavioral | mixed

  // Interview
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  evaluations: [],
  isLoading: false,
  isThinking: false,
  timeElapsed: 0,
  sessionStartTime: null,

  // Report
  report: null,

  // UI
  sidebarOpen: true,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_API_KEY': 
      localStorage.setItem('gemini_api_key', action.payload);
      return { ...state, apiKey: action.payload }
    case 'SET_SCREEN': return { ...state, screen: action.payload }
    case 'SET_RESUME_DATA': return { ...state, resumeData: action.payload }
    case 'SET_RESUME_TEXT': return { ...state, resumeText: action.payload }
    case 'SET_TOPIC': return { ...state, selectedTopic: action.payload }
    case 'SET_ROLE': return { ...state, selectedRole: action.payload }
    case 'SET_DIFFICULTY': return { ...state, difficulty: action.payload }
    case 'SET_QUESTION_COUNT': return { ...state, questionCount: action.payload }
    case 'SET_MODE': return { ...state, interviewMode: action.payload }
    case 'ADD_QUESTION': return { ...state, questions: [...state.questions, action.payload] }
    case 'SET_QUESTIONS': return { ...state, questions: action.payload }
    case 'NEXT_QUESTION': return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 }
    case 'ADD_ANSWER': return { ...state, answers: [...state.answers, action.payload] }
    case 'ADD_EVALUATION': return { ...state, evaluations: [...state.evaluations, action.payload] }
    case 'SET_LOADING': return { ...state, isLoading: action.payload }
    case 'SET_THINKING': return { ...state, isThinking: action.payload }
    case 'SET_REPORT': return { ...state, report: action.payload }
    case 'SET_SESSION_START': return { ...state, sessionStartTime: action.payload }
    case 'SET_TIME': return { ...state, timeElapsed: action.payload }
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarOpen: !state.sidebarOpen }
    case 'RESET_INTERVIEW':
      return {
        ...state,
        questions: [],
        currentQuestionIndex: 0,
        answers: [],
        evaluations: [],
        report: null,
        timeElapsed: 0,
        sessionStartTime: null,
      }
    case 'FULL_RESET':
      return { ...initialState }
    default:
      return state
  }
}

export function InterviewProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterview() {
  const ctx = useContext(InterviewContext)
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider')
  return ctx
}
