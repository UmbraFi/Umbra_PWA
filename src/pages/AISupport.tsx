import { Bot, Send } from 'lucide-react'
import { useState } from 'react'

interface Message {
  id: string
  text: string
  from: 'user' | 'bot'
}

const FAQ: Record<string, string> = {
  'how do i create a wallet': 'Go to Profile and tap "Create". You\'ll set up biometric verification and a 6-digit PIN to secure your wallet.',
  'how do i list an item': 'Tap the "Sell" tab at the bottom, fill in your item details, upload photos, and publish your listing.',
  'how do i buy something': 'Browse items on the Home or Discover tabs, tap a product to view details, then add it to your cart and checkout.',
  'how do i track my order': 'Go to Profile > My Purchases to see the status of your orders.',
  'how do i contact a seller': 'On any product page, tap the seller name to visit their profile, then use the message button to start a chat.',
  'is my wallet secure': 'Yes! Your wallet is protected by biometric verification and a 6-digit PIN. Your private keys are encrypted and stored locally on your device.',
}

function findAnswer(input: string): string {
  const normalized = input.toLowerCase().trim()
  for (const [question, answer] of Object.entries(FAQ)) {
    if (normalized.includes(question) || question.includes(normalized)) {
      return answer
    }
  }
  const keywords: Record<string, string> = {
    wallet: FAQ['how do i create a wallet'],
    sell: FAQ['how do i list an item'],
    list: FAQ['how do i list an item'],
    buy: FAQ['how do i buy something'],
    purchase: FAQ['how do i buy something'],
    order: FAQ['how do i track my order'],
    track: FAQ['how do i track my order'],
    message: FAQ['how do i contact a seller'],
    chat: FAQ['how do i contact a seller'],
    secure: FAQ['is my wallet secure'],
    safe: FAQ['is my wallet secure'],
  }
  for (const [keyword, answer] of Object.entries(keywords)) {
    if (normalized.includes(keyword)) return answer
  }
  return "I'm not sure about that. Try asking about creating a wallet, listing items, buying products, tracking orders, or contacting sellers."
}

export default function AISupport() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: "Hi! I'm Umbra's AI assistant. Ask me anything about using the app.", from: 'bot' },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    const userMsg: Message = { id: Date.now().toString(), text, from: 'user' }
    const botMsg: Message = { id: (Date.now() + 1).toString(), text: findAnswer(text), from: 'bot' }
    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-env(safe-area-inset-top,0px)-3.5rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                <Bot size={14} className="text-[var(--color-text-secondary)]" />
              </div>
            )}
            <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${msg.from === 'user' ? 'bg-black text-white rounded-br-md' : 'bg-gray-100 rounded-bl-md'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
          />
          <button type="button" onClick={handleSend} disabled={!input.trim()} className="tap-feedback w-10 h-10 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
