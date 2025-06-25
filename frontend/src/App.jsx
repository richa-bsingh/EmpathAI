import { useState, useRef, useEffect } from 'react'

const API_URL = 'http://localhost:8000/support'

import calm1 from '../public/images/3 copy 2.png'
import calm2 from '../public/images/3 copy 3.png'
import calm3 from '../public/images/3 copy.png'
import calm4 from '../public/images/3.png'

import energy1 from '../public/images/4.png'
import energy2 from '../public/images/5.png'
import energy3 from '../public/images/6.png'
import energy4 from '../public/images/7.png'


// Mood themes configuration
const moods = {
  calm: {
    name: 'Calm',
    icon: '🌙',
    bg: 'bg-gradient-to-br from-slate-900 to-slate-900',
    cardBg: 'bg-gradient-to-br from-slate-800 to-slate-800',
    border: 'border-slate-700',
    accent: 'from-blue-500 to-teal-500',
    userBubble: 'bg-teal-600',
    inputBg: 'bg-slate-700',
    inputFocus: 'focus:ring-teal-400',
    text: 'text-slate-100',
    textSecondary: 'text-slate-400',
    aiAvatar: 'from-teal-400 to-blue-500'
  },
  energized: {
    name: 'Energized',
    icon: '☀️',
    bg: 'bg-gradient-to-br from-yellow-200 to-pink-200',
    cardBg: 'bg-gradient-to-br from-yellow-100/90 to-pink-100/90',
    border: 'border-yellow-300/60',
    accent: 'from-yellow-300 to-pink-300',
    userBubble: 'bg-gradient-to-r from-yellow-400 to-pink-400',
    inputBg: 'bg-gradient-to-r from-yellow-50/80 to-pink-50/80',
    inputFocus: 'focus:ring-pink-300',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    aiAvatar: 'from-yellow-300 to-pink-300'
  }
}

export default function App() {
  const [currentMood, setCurrentMood] = useState('calm')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      final: "Hello, I'm here to listen. How are you feeling today?",
      emotion: '',
      behaviour: '',
      intelligence: ''
    }
  ])
  const [input, setInput] = useState('')
  const containerRef = useRef()

  const theme = moods[currentMood]

  useEffect(() => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [messages])

  const toggleMood = () => {
    setCurrentMood(prev => prev === 'calm' ? 'energized' : 'calm')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return

    setMessages(prev => [...prev, { sender: 'user', text: input }])
    setInput('')
    setMessages(prev => [...prev, { sender: 'ai', loading: true }])

    try {
      const history = messages
        .filter(m => !m.loading)
        .map(m => ({ role: m.sender, content: m.sender === 'user' ? m.text : m.final }))

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || res.statusText)

      setMessages(prev => {
        const noLoad = prev.filter(m => !m.loading)
        return [
          ...noLoad,
          {
            sender: 'ai',
            final: data.final_response,
            emotion: data.emotion,
            behaviour: data.behaviour,
            intelligence: data.intelligence
          }
        ]
      })
    } catch (err) {
      setMessages(prev => {
        const noLoad = prev.filter(m => !m.loading)
        return [...noLoad, { sender: 'error', text: `Error: ${err.message}` }]
      })
    }
  }

  const Tag = ({ c, label, t }) => (
    <div
      className={`
        text-xs font-medium
        bg-${c}-700 dark:bg-${c}-600
        text-${c}-100
        px-3 py-1 rounded-full
      `}
    >
      <strong>{label}:</strong> {t}
    </div>
  )

  const placeholderElements = [
    // Calm mode elements
    { type: 'image', src: calm1, mood: 'calm', className: 'top-20 left-10 opacity-30' },
    { type: 'image', src: calm2, mood: 'calm', className: 'top-40 right-10 opacity-25' },
    { type: 'image', src: calm3, mood: 'calm', className: 'bottom-32 left-14 opacity-20' },
    { type: 'image', src: calm4, mood: 'calm', className: 'bottom-48 right-12 opacity-30' },
    
    // Energized mode elements
    { type: 'image', src: energy1, mood: 'energized', className: 'top-24 left-10 opacity-25' },
    { type: 'image', src: energy2, mood: 'energized', className: 'top-36 right-6 opacity-30' },
    { type: 'image', src: energy3, mood: 'energized', className: 'bottom-40 left-12 opacity-25' },
    { type: 'image', src: energy4, mood: 'energized', className: 'bottom-24 right-10 opacity-20' },
  ]

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${theme.bg} ${theme.text} transition-colors duration-500 relative overflow-hidden`}>
      {/* Floating placeholder elements */}
      {placeholderElements
        .filter(el => el.mood === currentMood)
        .map((el, i) => (
          <div
            key={`${currentMood}-${i}`}
            className={`absolute pointer-events-none transition-all duration-1000 ${el.className} animate-pulse`}
            style={{ 
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          >
            <img 
              src={el.src} 
              alt="Mood decoration" 
              className="rounded-lg shadow-lg w-[175px] h-[175px] object-cover"          />
          </div>
        ))}
      
      <div className={`flex flex-col w-full max-w-2xl h-[95vh] ${theme.cardBg} rounded-2xl shadow-lg overflow-hidden transition-colors duration-500 relative z-10`}>
        {/* Header */}
        <header className={`p-5 border-b ${theme.border} text-center relative`}>
          <div className="flex items-center justify-between">
            <div className="w-12"></div> {/* Spacer */}
            <div>
              <h1 className="text-xl font-bold">EMPATHAI</h1>
              <p className={`text-sm ${theme.textSecondary}`}>Your AI Partner for Mental Well-being</p>
            </div>
            
            {/* Mood Toggle Button */}
            <button
              onClick={toggleMood}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-full
                bg-gradient-to-r ${theme.accent}
                text-white text-sm font-medium
                hover:scale-105 transition-all duration-200
                shadow-lg hover:shadow-xl
              `}
              title={`Switch to ${currentMood === 'calm' ? 'Energized' : 'Calm'} mood`}
            >
              <span className="text-lg">{theme.icon}</span>
              <span>{theme.name}</span>
            </button>
          </div>
        </header>

        {/* Chat */}
        <main ref={containerRef} className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-8">
            {messages.map((m, i) => (
              <div key={i}>
                {/* User message */}
                {m.sender === 'user' && (
                  <div className="flex justify-end">
                    <div className={`${theme.userBubble} text-white p-4 rounded-xl rounded-br-none max-w-lg shadow transition-colors duration-500`}>
                      <p>{m.text}</p>
                    </div>
                  </div>
                )}

                {/* AI or Error */}
                {(m.sender === 'ai' || m.sender === 'error') && (
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                        flex items-center justify-center font-semibold h-9 w-9 rounded-full shadow-md transition-all duration-500
                        ${m.sender === 'error'
                          ? 'bg-red-600 text-white'
                          : `bg-gradient-to-br ${theme.aiAvatar} text-white`}
                      `}
                    >
                      {m.sender === 'error' ? '!' : 'AI'}
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-lg">
                      <div
                        className={`
                          p-4 rounded-xl rounded-tl-none transition-colors duration-500
                          ${m.sender === 'error'
                            ? 'bg-red-700 text-red-100'
                            : `${theme.cardBg} ${theme.text} border ${theme.border}`}
                        `}
                      >
                        <p>{m.loading ? '…' : m.final || m.text}</p>
                      </div>

                      {/* Reasoning Analysis */}
                      {!m.loading && m.sender === 'ai' && (
                        <details className={`mt-2 ${theme.cardBg} p-3 rounded-lg border ${theme.border} transition-colors duration-500`}>
                          <summary className={`cursor-pointer font-medium ${theme.text}`}>
                            Reasoning Analysis
                          </summary>
                          <div className="mt-2 flex flex-wrap gap-2 px-1">
                            <Tag c="sky" label="Emotion" t={m.emotion} />
                            <Tag c="emerald" label="Behaviour" t={m.behaviour} />
                            <Tag c="fuchsia" label="Intelligence" t={m.intelligence} />
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Input */}
        <footer className={`p-4 border-t ${theme.border} transition-colors duration-500`}>
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className={`flex-1 p-3 ${theme.inputBg} ${theme.text} ${theme.textSecondary.replace('text-', 'placeholder-')} rounded-full focus:outline-none focus:ring-2 ${theme.inputFocus} transition-colors duration-500`}
              onKeyPress={e => e.key === 'Enter' && handleSubmit(e)}
            />
            <button
              onClick={handleSubmit}
              className={`bg-gradient-to-br ${theme.accent} text-white p-3 rounded-full shadow-md hover:scale-105 transition-all duration-200`}
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}