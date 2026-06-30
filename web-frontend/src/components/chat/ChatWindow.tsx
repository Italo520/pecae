'use client';

import { 
  MoreVertical, 
  Paperclip, 
  Send, 
  Phone, 
  Info,
  Car
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Mocks
const MOCK_MESSAGES = [
  { id: 1, text: 'Olá! Vi o anúncio do Gol G4.', sender: 'buyer', time: '10:42' },
  { id: 2, text: 'Bom dia, o motor ainda está disponível?', sender: 'buyer', time: '10:45' },
  { id: 3, text: 'Bom dia Carlos! Sim, o motor completo está disponível. Qual peça exatamente você precisa?', sender: 'me', time: '10:48' },
];

export default function ChatWindow({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      text: input,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    setInput('');
    
    // Mock reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Vou analisar e retorno. Obrigado!',
        sender: 'buyer',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] relative">
      {/* Header */}
      <div className="h-[72px] px-6 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-medium shadow-inner">
            C
          </div>
          <div>
            <h2 className="text-white font-medium">Carlos Silva</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span className="text-[var(--color-primary)]">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors">
            <Info className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Context Banner */}
      <div className="bg-white/5 border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg text-white/70">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-white/50">Interesse em</p>
            <p className="text-sm font-medium text-white">Gol G4 2008 - Sucata Completa</p>
          </div>
        </div>
        <button className="text-[var(--color-primary)] text-sm font-medium hover:underline">
          Ver Anúncio
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl ${
                isMine 
                  ? 'bg-[var(--color-primary)] text-black rounded-tr-sm shadow-[0_0_15px_rgba(20,241,149,0.15)]' 
                  : 'bg-white/10 text-white/90 rounded-tl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              <span className="text-[10px] text-white/40 mt-1 px-1">{msg.time}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[var(--color-primary)]/50 focus-within:ring-1 focus-within:ring-[var(--color-primary)]/50 transition-all">
          <button className="p-3 text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent text-white placeholder:text-white/40 resize-none py-3 outline-none text-sm custom-scrollbar"
            rows={1}
            style={{
              height: 'auto'
            }}
          />
          
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-[var(--color-primary)] text-black rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,241,149,0.2)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
