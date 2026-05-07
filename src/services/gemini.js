// Gemini AI Service
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAtGfS1vZIv0SCYLgjPOKZs6HGNJCItozI'
const genAI = new GoogleGenerativeAI(API_KEY)

let conversationHistory = []

export function resetConversation() {
  conversationHistory = []
}

export async function sendMessage(userMessage, systemContext = '') {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemContext,
  })

  const chat = model.startChat({
    history: conversationHistory,
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.85,
    },
  })

  const result = await chat.sendMessage(userMessage)
  const response = result.response.text()

  conversationHistory.push(
    { role: 'user', parts: [{ text: userMessage }] },
    { role: 'model', parts: [{ text: response }] }
  )

  return response
}

export async function analyzeResume(resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const prompt = `Analyze this resume and extract structured information. Return ONLY valid JSON with this exact structure:
{
  "name": "candidate name",
  "title": "current/target role",
  "skills": ["skill1", "skill2", ...],
  "experience": [{"role": "...", "company": "...", "duration": "..."}],
  "projects": [{"name": "...", "tech": ["..."], "description": "..."}],
  "education": [{"degree": "...", "institution": "...", "year": "..."}],
  "achievements": ["achievement1", ...],
  "yearsOfExperience": number,
  "topTechnologies": ["tech1", "tech2", "tech3"],
  "weakAreas": ["area that seems vague or missing"],
  "interviewTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"]
}

Resume:
${resumeText}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  throw new Error('Failed to parse resume')
}

export async function generateInterviewQuestion(context) {
  const { resumeData, topic, difficulty, questionNumber, previousQuestions } = context
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are an expert technical interviewer. Generate interview question #${questionNumber}.

Candidate Profile:
- Skills: ${resumeData?.skills?.join(', ') || topic}
- Projects: ${resumeData?.projects?.map(p => p.name).join(', ') || 'N/A'}
- Experience: ${resumeData?.yearsOfExperience || 'N/A'} years

Topic: ${topic}
Difficulty: ${difficulty} (1=easy, 2=medium, 3=hard)
Previous questions asked: ${previousQuestions?.join(' | ') || 'None'}

Generate ONE fresh interview question. Make it specific to their background. Include a brief context if needed.
Return ONLY the question text, nothing else.`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

export async function evaluateAnswer(context) {
  const { question, answer, topic, difficulty } = context
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question}
Topic: ${topic}
Difficulty: ${difficulty}/3
Candidate's Answer: ${answer}

Evaluate the answer and return ONLY valid JSON:
{
  "score": <number 0-100>,
  "technicalAccuracy": <number 0-100>,
  "communicationClarity": <number 0-100>,
  "completeness": <number 0-100>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "idealAnswer": "<brief outline of ideal answer>",
  "sentiment": "<positive|neutral|negative>"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  return {
    score: 60, technicalAccuracy: 60, communicationClarity: 60, completeness: 60,
    feedback: 'Good attempt. Keep practicing.',
    strengths: ['Attempted the question'], improvements: ['Be more specific'],
    idealAnswer: 'A comprehensive answer covering key concepts.', sentiment: 'neutral'
  }
}

export async function generateFinalReport(context) {
  const { resumeData, topic, answers, scores } = context
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Generate a final interview evaluation report.

Candidate: ${resumeData?.name || 'Candidate'}
Topic: ${topic}
Average Score: ${avgScore.toFixed(1)}/100
Number of Questions: ${answers.length}

Return ONLY valid JSON:
{
  "overallScore": ${Math.round(avgScore)},
  "grade": "<A+|A|B+|B|C+|C|D|F>",
  "verdict": "<Strongly Recommended|Recommended|Consider|Not Recommended>",
  "summary": "<3-4 sentence overall assessment>",
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "problemSolvingScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"],
  "learningResources": [{"topic": "...", "resource": "..."}],
  "nextSteps": ["step1", "step2", "step3"],
  "hireProbability": <number 0-100>
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return JSON.parse(jsonMatch[0])
  return null
}
