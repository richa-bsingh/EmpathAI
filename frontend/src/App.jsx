import { useState, useRef, useEffect } from 'react'

// const API_URL = 'http://localhost:8000/support'
const API_URL = "https://empathai-easw.onrender.com"

import calm1 from '../public/images/3 copy 2.png'
import calm2 from '../public/images/3 copy 3.png'
import calm3 from '../public/images/3 copy.png'
import calm4 from '../public/images/3.png'

import energy1 from '../public/images/4.png'
import energy2 from '../public/images/5.png'
import energy3 from '../public/images/6.png'
import energy4 from '../public/images/7.png'

// Quick response suggestions
const quickResponses = [
  "I'm feeling anxious today",
  "I need someone to talk to",
  "I'm feeling overwhelmed",
  "I'm having trouble sleeping",
  "I feel lonely",
  "I'm stressed about work",
  "I'm feeling sad",
  "I want to practice gratitude"
]

// Enhanced mood themes configuration
const moods = {
  calm: {
    name: 'Calm',
    icon: '🌙',
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    cardBg: 'bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-sm',
    border: 'border-slate-600/50',
    accent: 'from-blue-500 to-teal-500',
    userBubble: 'bg-gradient-to-r from-teal-600 to-blue-600',
    inputBg: 'bg-slate-700/80 backdrop-blur-sm',
    inputFocus: 'focus:ring-teal-400 focus:border-teal-400',
    text: 'text-slate-100',
    textSecondary: 'text-slate-400',
    aiAvatar: 'from-teal-400 to-blue-500',
    shadow: 'shadow-2xl shadow-slate-900/50',
    aiEmoji: 'AI'
  },
  energized: {
    name: 'Energized',
    icon: '☀️',
    bg: 'bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200',
    cardBg: 'bg-gradient-to-br from-yellow-100/95 to-pink-100/95 backdrop-blur-sm',
    border: 'border-yellow-300/60',
    accent: 'from-yellow-400 to-pink-400',
    userBubble: 'bg-gradient-to-r from-yellow-500 to-pink-500',
    inputBg: 'bg-gradient-to-r from-yellow-50/90 to-pink-50/90 backdrop-blur-sm',
    inputFocus: 'focus:ring-pink-400 focus:border-pink-400',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    aiAvatar: 'from-yellow-400 to-pink-400',
    shadow: 'shadow-2xl shadow-yellow-200/50',
    aiEmoji: 'AI'
  }
}

export default function App() {
  const [currentMood, setCurrentMood] = useState('calm')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      final: "Hello, I'm here to listen and support you. How are you feeling today?",
      emotion: '',
      behaviour: '',
      intelligence: '',
      mood_description: '',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickResponses, setShowQuickResponses] = useState(true)
  const containerRef = useRef()

  const theme = moods[currentMood]

  useEffect(() => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [messages])

  const toggleMood = () => {
    const moodKeys = Object.keys(moods)
    const currentIndex = moodKeys.indexOf(currentMood)
    const nextIndex = (currentIndex + 1) % moodKeys.length
    setCurrentMood(moodKeys[nextIndex])
  }

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { 
      sender: 'user', 
      text: input, 
      timestamp: new Date() 
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setShowQuickResponses(false)
    
    const loadingMessage = { 
      sender: 'ai', 
      loading: true, 
      timestamp: new Date() 
    }
    setMessages(prev => [...prev, loadingMessage])
    setIsTyping(true)

    try {
      const history = messages
        .filter(m => !m.loading && m.sender !== 'error')
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
            intelligence: data.intelligence,
            mood_description: data.mood_description,
            timestamp: new Date()
          }
        ]
      })
    } catch (err) {
      setMessages(prev => {
        const noLoad = prev.filter(m => !m.loading)
        return [...noLoad, { 
          sender: 'error', 
          text: `I'm having trouble connecting right now. Please try again in a moment.`, 
          timestamp: new Date() 
        }]
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickResponse = (response) => {
    setInput(response)
    setShowQuickResponses(false)
  }

  const Tag = ({ c, label, t }) => (
    <div
      className={`
        text-xs font-medium
        bg-${c}-100 dark:bg-${c}-800
        text-${c}-800 dark:text-${c}-200
        px-3 py-1.5 rounded-full
        border border-${c}-200 dark:border-${c}-700
        transition-all duration-200 hover:scale-105
      `}
    >
      <strong>{label}:</strong> {t}
    </div>
  )

  const TypingIndicator = () => (
    <div className="flex items-center gap-2 p-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-500">EmpathAI typing...</span>
    </div>
  )

  const placeholderElements = [
    // Calm mode elements
    { type: 'image', src: calm1, mood: 'calm', className: 'top-20 left-10 opacity-20' },
    { type: 'image', src: calm2, mood: 'calm', className: 'top-40 right-10 opacity-15' },
    { type: 'image', src: calm3, mood: 'calm', className: 'bottom-32 left-14 opacity-10' },
    { type: 'image', src: calm4, mood: 'calm', className: 'bottom-48 right-12 opacity-20' },
    
    // Energized mode elements
    { type: 'image', src: energy1, mood: 'energized', className: 'top-24 left-10 opacity-15' },
    { type: 'image', src: energy2, mood: 'energized', className: 'top-36 right-6 opacity-20' },
    { type: 'image', src: energy3, mood: 'energized', className: 'bottom-40 left-12 opacity-15' },
    { type: 'image', src: energy4, mood: 'energized', className: 'bottom-24 right-10 opacity-10' },
  ]

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
      
      <div className={`flex items-center justify-center min-h-screen p-4 ${theme.bg} ${theme.text} transition-all duration-700 relative overflow-hidden`}>
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
                className="rounded-lg shadow-lg w-[150px] h-[150px] object-cover opacity-60"          />
            </div>
          ))}
        
        <div className={`flex flex-col w-full max-w-2xl h-[95vh] ${theme.cardBg} rounded-3xl ${theme.shadow} overflow-hidden transition-all duration-700 relative z-10 border ${theme.border}`}>
          {/* Header */}
          <header className={`p-6 border-b ${theme.border} text-center relative backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
              <div className="w-12"></div> {/* Spacer */}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EmpathAI
                </h1>
                <p className={`text-sm ${theme.textSecondary} mt-1`}>Your compassionate AI companion for mental well-being</p>
              </div>
              
              {/* Mood Toggle Button */}
              <button
                onClick={toggleMood}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-full
                  bg-gradient-to-r ${theme.accent}
                  text-white text-sm font-medium
                  hover:scale-105 transition-all duration-300
                  shadow-lg hover:shadow-xl
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
                title={`Switch to ${moods[Object.keys(moods).find(key => key !== currentMood)]?.name} mood`}
                aria-label={`Switch to ${moods[Object.keys(moods).find(key => key !== currentMood)]?.name} mood`}
              >
                <span className="text-lg">{theme.icon}</span>
                <span>{theme.name}</span>
              </button>
            </div>
          </header>

          {/* Chat */}
          <main ref={containerRef} className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={m.sender === 'user' ? 'animate-slideInRight' : 'animate-slideIn'}>
                  {/* User message */}
                  {m.sender === 'user' && (
                    <div className="flex justify-end">
                      <div className="flex flex-col items-end max-w-lg">
                        <div className={`${theme.userBubble} text-white p-4 rounded-2xl rounded-br-md shadow-lg transition-all duration-300 hover:shadow-xl`}>
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                        <span className={`text-xs ${theme.textSecondary} mt-2`}>
                          {formatTime(m.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* AI or Error */}
                  {(m.sender === 'ai' || m.sender === 'error') && (
                    <div className="flex items-start gap-4">
                      <div
                        className={`
                          flex items-center justify-center font-semibold h-10 w-10 rounded-full shadow-lg transition-all duration-300
                          ${m.sender === 'error'
                            ? 'bg-red-500 text-white'
                            : `bg-gradient-to-br ${theme.aiAvatar} text-white`}
                        `}
                      >
                        {m.sender === 'error' ? '⚠️' : theme.aiEmoji}
                      </div>

                      <div className="flex flex-col gap-3 w-full max-w-lg">
                        <div
                          className={`
                            p-4 rounded-2xl rounded-tl-md transition-all duration-300
                            ${m.sender === 'error'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : `${theme.cardBg} ${theme.text} border ${theme.border}`}
                          `}
                        >
                          {m.loading ? (
                            <TypingIndicator />
                          ) : (
                            <p className="leading-relaxed">{m.final || m.text}</p>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className={`text-xs ${theme.textSecondary} ml-2`}>
                          {formatTime(m.timestamp)}
                        </span>

                        {/* Reasoning Analysis */}
                        {!m.loading && m.sender === 'ai' && (
                          <details className={`mt-2 ${theme.cardBg} p-4 rounded-xl border ${theme.border} transition-all duration-300 hover:shadow-md`}>
                            <summary className={`cursor-pointer font-medium ${theme.text} hover:text-blue-400 transition-colors duration-200`}>
                              View AI Analysis
                            </summary>
                            <div className="mt-3 flex flex-wrap gap-2 px-1">
                              <Tag c="purple" label="Mood" t={m.mood_description} />
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

          {/* Quick Response Buttons */}
          {/* {showQuickResponses && messages.length === 1 && (
            <div className="px-6 pb-4 animate-fadeIn">
              <p className={`text-sm ${theme.textSecondary} mb-3 text-center`}>
                Quick ways to start our conversation:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    className={`
                      px-3 py-2 text-xs rounded-full transition-all duration-200
                      bg-gradient-to-r ${theme.accent} text-white
                      hover:scale-105 hover:shadow-md
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )} */}

          {/* Input */}
          <footer className={`p-6 border-t ${theme.border} transition-all duration-500 backdrop-blur-sm`}>
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Share what's on your mind..."
                className={`
                  flex-1 p-4 ${theme.inputBg} ${theme.text} 
                  ${theme.textSecondary.replace('text-', 'placeholder-')} 
                  rounded-2xl focus:outline-none focus:ring-2 ${theme.inputFocus} 
                  transition-all duration-300 border ${theme.border}
                  hover:shadow-md focus:shadow-lg
                `}
                disabled={isTyping}
                aria-label="Type your message"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className={`
                  bg-gradient-to-br ${theme.accent} text-white p-4 rounded-2xl 
                  shadow-lg hover:scale-105 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  min-w-[60px]
                `}
                aria-label="Send message"
              >
                {isTyping ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </footer>
        </div>
      </div>
    </>
  )
}
