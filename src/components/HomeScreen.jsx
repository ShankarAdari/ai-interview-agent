import React from 'react'
import { Brain, Sparkles, Shield, Target, Zap, ChevronRight, BarChart2, MessageSquare, Play } from 'lucide-react'
import { useInterview } from '../context/InterviewContext'
import { motion } from 'framer-motion'
import { StatCard } from './UI'

export default function HomeScreen() {
  const { dispatch } = useInterview()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Hero Section */}
      <section style={{ 
        minHeight: '80vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '100px 0'
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ 
            padding: '8px 20px', borderRadius: 'var(--radius-full)', 
            background: 'rgba(108, 99, 255, 0.1)', border: '1px solid rgba(108, 99, 255, 0.2)',
            color: 'var(--accent-secondary)', fontSize: 14, fontWeight: 700, 
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32,
            letterSpacing: '0.05em', textTransform: 'uppercase'
          }}
        >
          <Sparkles size={16} /> Powered by Gemini 1.5 Flash
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="heading-hero text-gradient"
          style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', maxWidth: 1000, lineHeight: 1.1, marginBottom: 24 }}
        >
          Master Your Next <br /> Tech Interview with AI.
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: 'clamp(18px, 3vw, 20px)', color: 'var(--text-secondary)', maxWidth: 700, marginBottom: 48, lineHeight: 1.6 }}
        >
          Experience high-fidelity simulations that adapt to your resume, 
          providing real-time feedback and technical deep-dives to ensure you're job-ready.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button 
            className="btn btn-primary btn-lg glow-primary"
            onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'setup' })}
            style={{ padding: '20px 48px', fontSize: 18, borderRadius: 16 }}
          >
            Start Free Session <ChevronRight size={20} style={{ marginLeft: 8 }} />
          </button>
          <button 
            className="btn btn-ghost btn-lg"
            style={{ padding: '20px 40px', fontSize: 18, border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}
          >
            <Play size={18} style={{ marginRight: 10, fill: 'currentColor' }} /> How it Works
          </button>
        </motion.div>
      </section>

      {/* Stats / Proof */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 24, maxWidth: 1200, margin: '0 auto 120px' 
        }}
      >
        <motion.div variants={itemVariants}>
          <StatCard label="Accuracy" value="99.4%" sub="Gemini Flash Reasoning" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard label="Scenarios" value="500+" sub="Industry-specific Domains" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard label="Success Rate" value="85%" sub="User Placement Increase" />
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 className="heading-hero" style={{ fontSize: '2.5rem', marginBottom: 16 }}>Elite Features for Elite Talent</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>Engineered to replicate the pressure and depth of Tier-1 tech interviews.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}
        >
          <FeatureCard 
            icon={<Target color="var(--accent-primary)" />}
            title="Resume-Adaptive AI"
            desc="Our AI parses your professional history to ask tailored questions that probe your actual experience."
          />
          <FeatureCard 
            icon={<MessageSquare color="var(--accent-cyan)" />}
            title="Voice-to-Logic"
            desc="Speak your answers naturally. We use advanced Speech API to convert your voice into structured logic for evaluation."
          />
          <FeatureCard 
            icon={<BarChart2 color="var(--accent-emerald)" />}
            title="Atomic Scoring"
            desc="Get broken down scores for communication, technical depth, and problem-solving after every question."
          />
          <FeatureCard 
            icon={<Shield color="var(--accent-rose)" />}
            title="Difficulty Scaling"
            desc="From Junior roles to Principal Architect level - the AI adjusts the mental load dynamically."
          />
          <FeatureCard 
            icon={<Zap color="var(--accent-amber)" />}
            title="Instant Evaluation"
            desc="No waiting. Get feedback within seconds of finishing your response, complete with optimal solutions."
          />
          <FeatureCard 
            icon={<Brain color="var(--accent-secondary)" />}
            title="Neural Summaries"
            desc="A final deep-dive report that identifies your blind spots and provides a clear hiring probability."
          />
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '60px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>InterviewAI</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>© 2026 Advanced Agentic Coding. Built for the future of recruitment.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="glass glass-hover" 
      style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div style={{ 
        width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.03)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>{desc}</p>
    </motion.div>
  )
}
